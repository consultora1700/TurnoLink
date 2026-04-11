'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Search, ShoppingBag, MapPin, Phone, Instagram, Facebook, ExternalLink, X, ChevronLeft, ChevronRight, CreditCard, Loader2, Tag, Package, ArrowRight, Layers, Truck, User, Mail, FileText, CheckCircle2, AlertCircle, ZoomIn, Share2, Link2, Check, Clock, ClipboardList, SlidersHorizontal, CalendarDays, Building2, HardHat, TrendingUp, Target, Ruler, DollarSign, ChevronDown, BedDouble, Bath, Car, Maximize2, LandPlot, Waves, LayoutGrid, TreePine, Calendar, Download } from 'lucide-react';
import { PublicHero } from '@/components/booking/public-hero';
import { PublicThemeWrapper, PublicThemeToggleFloating } from '@/components/booking/public-theme-wrapper';
import { PublicServiceCard } from '@/components/booking/public-service-card';
import { BackgroundStyles } from '@/components/ui/background-styles';
import { formatPrice as _formatPrice } from '@/lib/utils';
import { publicApi } from '@/lib/api';
import { PublicSorteoCard } from '@/components/booking/public-sorteo-card';
import { HERO_STYLES } from '@/lib/hero-styles';
import { AdSenseBanner, AdPlaceholderBanner } from '@/components/ads/adsense-banner';
import type { TenantPublic, Product, ProductCategory, TenantBranding, ProductAttribute } from '@/lib/api';
import type { HeroStyleName } from '@/lib/hero-styles';
import { buildAttributeSummary, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { useGastroCartStore, type OrderType, type GastroCartOption } from '@/lib/gastro-cart-store';
import { OrderModeSelector } from '@/components/gastro/order-mode-selector';
import { ProductAddModal } from '@/components/gastro/product-add-modal';
import { GastroCartFloating } from '@/components/gastro/cart-drawer';
import { GastroCheckout } from '@/components/gastro/gastro-checkout';
import { TableReservation } from '@/components/gastro/table-reservation';

interface ShippingConfig {
  pickup?: { enabled: boolean; address?: string; hours?: string };
  delivery?: { enabled: boolean; info?: string };
  meetingPoint?: { enabled: boolean; info?: string };
}

interface DevelopmentProject {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  progressPercent: number;
  status: string;
  coverImage?: string;
  totalUnits: number;
  latitude?: number | null;
  longitude?: number | null;
  _count?: { units: number };
}

interface Props {
  tenant: TenantPublic;
  slug: string;
  products: Product[];
  categories: ProductCategory[];
  branding?: TenantBranding | null;
  showAds?: boolean;
  developments?: DevelopmentProject[];
}

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

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('54') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `54${digits.slice(1)}`;
  if (digits.length === 10) return `54${digits}`;
  return digits;
}

function stripHtml(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:div|p|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── Real-estate description intelligence engine ──────────────────────────────
// Parses raw description text to:
//  1. Strip trailing structured data block that duplicates attribute fields
//  2. Extract high-value commercial signals (APTO CRÉDITO, rental status, floor, etc.)
//  3. Return clean prose description + extracted metadata
interface PropertyIntel {
  cleanDescription: string;
  extractedAttrs: Array<{ label: string; value: string }>;
}

function processPropertyDescription(rawDesc: string, existingAttrs: ProductAttribute[]): PropertyIntel {
  // Step 1 — decode HTML entities & strip tags, preserving line breaks
  let text = rawDesc
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:div|p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const extractedAttrs: PropertyIntel['extractedAttrs'] = [];
  const existingKeys = new Set(existingAttrs.map(a => a.key));
  const existingLabels = new Set(existingAttrs.map(a => a.label.toLowerCase()));
  const has = (key: string) => existingKeys.has(key) || existingLabels.has(key.toLowerCase());

  // Step 2 — Extract high-value signals
  // APTO CRÉDITO / APTO BANCO
  if (/apto\s+(cr[eé]dito|banco)/i.test(text)) {
    extractedAttrs.push({ label: 'Apto crédito', value: 'Sí' });
    text = text.replace(/\.?\s*apto\s+(cr[eé]dito|banco)\.?\s*/gi, ' ');
  }

  // Rental status: "alquilado/a hasta DD/MM/YYYY" or "alquilado"
  const rentalMatch = text.match(/alquilad[oa]\s+hasta\s+(?:el\s+)?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+de\s+\w+\s+(?:de\s+)?\d{4}|\w+\s+(?:de\s+)?\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  if (rentalMatch) {
    extractedAttrs.push({ label: 'Alquilado hasta', value: rentalMatch[1] });
  } else if (/\balquilad[oa]\b/i.test(text) && !/no\s+alquilad/i.test(text)) {
    extractedAttrs.push({ label: 'Estado ocupación', value: 'Alquilado' });
  }

  // Floor / Piso
  const pisoMatch = text.match(/(?:piso\s+(\d{1,2})|(\d{1,2})[°º]?\s*piso)/i);
  if (pisoMatch && !has('piso')) {
    extractedAttrs.push({ label: 'Piso', value: pisoMatch[1] || pisoMatch[2] });
  }

  // Plantas — "dos plantas", "en dos plantas", "2 plantas"
  const plantasWordMap: Record<string, string> = { una: '1', dos: '2', tres: '3', cuatro: '4' };
  const plantasMatch = text.match(/(?:en\s+)?(\d{1,2}|una|dos|tres|cuatro)\s+plantas?(?:\b|[.,])/i);
  if (plantasMatch && !has('plantas')) {
    const val = plantasWordMap[plantasMatch[1].toLowerCase()] || plantasMatch[1];
    extractedAttrs.push({ label: 'Plantas', value: val });
  }

  // Dormitorios — "3 dormitorios", "tres dormitorios"
  const dormWordMap: Record<string, string> = { un: '1', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5' };
  const dormMatch = text.match(/(\d{1,2}|un|uno|una|dos|tres|cuatro|cinco)\s+dormitorios?/i);
  if (dormMatch && !has('dormitorios')) {
    const val = dormWordMap[dormMatch[1].toLowerCase()] || dormMatch[1];
    extractedAttrs.push({ label: 'Dormitorios', value: val });
  }

  // Baños — "2 baños"
  const banosMatch = text.match(/(\d{1,2}|un|uno|dos|tres|cuatro)\s+ba[ñn]os?/i);
  if (banosMatch && !has('banos') && !has('baños')) {
    const val = dormWordMap[banosMatch[1].toLowerCase()] || banosMatch[1];
    extractedAttrs.push({ label: 'Baños', value: val });
  }

  // Ambientes — "7 ambientes"
  const ambMatch = text.match(/(\d{1,2})\s+ambientes?/i);
  if (ambMatch && !has('ambientes')) {
    extractedAttrs.push({ label: 'Ambientes', value: ambMatch[1] });
  }

  // Cochera/garage
  if (!has('cochera') && !has('cocheras') && !has('garage')) {
    const cochMatch = text.match(/(?:cochera|garage)\s+(?:para\s+)?(\d{1,2})\s+autos?/i);
    if (cochMatch) extractedAttrs.push({ label: 'Cocheras', value: cochMatch[1] });
    else if (/\bcochera\s+cubierta\b/i.test(text)) extractedAttrs.push({ label: 'Cochera', value: 'Cubierta' });
    else if (/\bcochera\s+descubierta\b/i.test(text)) extractedAttrs.push({ label: 'Cochera', value: 'Descubierta' });
  }

  // Pileta
  const piletaMatch = text.match(/pileta\s+(?:de\s+)?(\d+\s*x\s*\d+)/i);
  if (piletaMatch) {
    extractedAttrs.push({ label: 'Pileta', value: piletaMatch[1].replace(/\s/g, '') });
  } else if (/\bpileta\s+climatizada\b/i.test(text)) {
    extractedAttrs.push({ label: 'Pileta', value: 'Climatizada' });
  } else if (/\bpileta\b/i.test(text) && !has('pileta')) {
    extractedAttrs.push({ label: 'Pileta', value: 'Sí' });
  }

  // Antigüedad
  const antMatch = text.match(/antig[üu]edad[:\s]+(\d+)\s*a[ñn]os/i);
  if (antMatch && !has('antiguedad') && !has('antigüedad')) {
    extractedAttrs.push({ label: 'Antigüedad', value: `${antMatch[1]} años` });
  }

  // NO MASCOTAS → ficha attr, not badge
  if (/no\s+se\s+admiten\s+mascotas/i.test(text)) {
    extractedAttrs.push({ label: 'Mascotas', value: 'No admite' });
  }

  // Escriturable / Escritura inmediata
  if (/escritura\s+inmediata|listo\s+para\s+escriturar/i.test(text)) {
    extractedAttrs.push({ label: 'Escritura', value: 'Inmediata' });
  }

  // Step 3 — Cut trailing structured data block (duplicated from attributes)
  const structuredTailPatterns = [
    /^(?:Situaci[oó]n|Orientaci[oó]n|Estado|Disposici[oó]n|Expensas|Antig[üu]edad|Superficie\s+\w+|Total\s+construido|Semicubierta|Descubierta|Frente|Fondo|Cocheras|Plantas)\s*:/im,
    /^SERVICIOS\b/im,
    /^AMBIENTES\b/im,
    /^ADICIONALES\b/im,
    /^\s*Servicios:\s/im,
  ];

  const lines = text.split('\n');
  let cutIndex = lines.length;

  const minLine = Math.floor(lines.length * 0.4);
  for (let i = minLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    for (const pattern of structuredTailPatterns) {
      if (pattern.test(line)) {
        if (/^\w[\w\s.]+:\s/.test(line) || /^(SERVICIOS|AMBIENTES|ADICIONALES)\b/.test(line)) {
          cutIndex = i;
          break;
        }
      }
    }
    if (cutIndex < lines.length) break;
  }

  text = lines.slice(0, cutIndex).join('\n').trim();

  // Step 4 — Strip trailing boilerplate
  text = text
    .replace(/>\s*Las?\s+visitas?\s+se\s+coordinan[\s\S]*$/i, '')
    .replace(/Escribinos\s+tu\s+consulta\s+a\s+\S+[\s\S]*$/i, '')
    .replace(/-\s*Rodrigo\s+Propiedades\s*-?\s*$/i, '')
    .replace(/Interesados\s+con\s+requisitos[\s\S]*$/i, '')
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Step 5 — Clean up "Requisitos para el alquiler" block → ficha attr
  const reqMatch = text.match(/(?:Requisitos?\s+para\s+el\s+alquiler[\s\S]*?)(?=\n\n|$)/i);
  if (reqMatch) {
    extractedAttrs.push({ label: 'Requisitos', value: 'Disponibles' });
    text = text.replace(reqMatch[0], '').replace(/\n{3,}/g, '\n\n').trim();
  }

  // Step 6 — Contract info extraction
  const contratoMatch = text.match(/contrato\s+por\s+(\d+)\s+meses/i);
  if (contratoMatch) {
    extractedAttrs.push({ label: 'Contrato', value: `${contratoMatch[1]} meses` });
  }
  const ajusteMatch = text.match(/ajuste\s+(cuatrimestral|trimestral|semestral|mensual|anual)\s+(?:\(?(?:\d+\))?\s*)?(?:por\s+)?(?:[ií]ndice\s+)?(ICL|IPC|CER)?/i);
  if (ajusteMatch) {
    extractedAttrs.push({ label: 'Ajuste', value: `${ajusteMatch[1]}${ajusteMatch[2] ? ` ${ajusteMatch[2].toUpperCase()}` : ''}` });
  }

  // Clean contract/ajuste/mascotas lines from description
  text = text
    .replace(/Contrato\s+por\s+\d+\s+meses[^.\n]*\.?\s*/gi, '')
    .replace(/,?\s*con\s+ajuste\s+(cuatrimestral|trimestral|semestral|mensual|anual)\s+(?:\(?(?:\d+\))?\s*)?(?:por\s+)?(?:[ií]ndice\s+)?(ICL|IPC|CER)?\.?\s*/gi, ' ')
    .replace(/NO\s+SE\s+ADMITEN\s+MASCOTAS\.?\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanDescription: text, extractedAttrs };
}

export function PublicCatalogPage({ tenant, slug, products, categories, branding, showAds = false, developments = [] }: Props) {
  // ── Guard: inmobiliarias gets its own premium page ──
  const _rubro = (tenant.settings as any)?.rubro || '';
  if (_rubro === 'inmobiliarias') {
    const { PublicRealEstatePage } = require('./real-estate/public-real-estate-page');
    return <PublicRealEstatePage tenant={tenant} slug={slug} products={products} categories={categories} branding={branding} developments={developments} />;
  }

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  // Gastro scroll-spy: tracks which category section is currently visible
  const [gastroActiveCat, setGastroActiveCat] = useState<string | null>(null);
  const gastroSectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const gastroNavRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasMercadoPago, setHasMercadoPago] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [attrFilters, setAttrFilters] = useState<Record<string, string[]>>({});
  // Range filters store selected bucket as "min-max" string (e.g. "0-50", "50-100", "200-Infinity")
  const [rangeFilters, setRangeFilters] = useState<Record<string, string | null>>({});
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [activeTab, setActiveTab] = useState<'properties' | 'developments'>('properties');
  // expandedFilter removed — all filter groups always visible

  // ── Development project modal ──
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [devDetail, setDevDetail] = useState<any>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [devGalleryIdx, setDevGalleryIdx] = useState(0);

  const handleOpenDevModal = useCallback(async (devSlug: string) => {
    setDevModalOpen(true);
    setDevLoading(true);
    setDevDetail(null);
    setDevGalleryIdx(0);
    document.body.style.overflow = 'hidden';
    try {
      const detail = await publicApi.getDevelopment(slug, devSlug);
      setDevDetail(detail);
    } catch (e) { console.error(e); }
    finally { setDevLoading(false); }
  }, [slug]);

  const closeDevModal = useCallback(() => {
    setDevModalOpen(false);
    setDevDetail(null);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && devModalOpen) closeDevModal(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [devModalOpen, closeDevModal]);

  const settings = tenant.settings as any;
  // Fixed palette — consistent across all gastro/catalog tenants (matches tracking page style)
  const primaryColor = settings?.primaryColor || branding?.primaryColor || '#111827';
  const tenantCurrency: string = settings?.currency || 'ARS';
  const whatsappNumber = tenant.phone ? normalizePhoneForWhatsApp(tenant.phone) : '';

  // ── Gastro mode ──
  const isGastro = isGastronomiaRubro(settings?.rubro || '');
  const [gastroProduct, setGastroProduct] = useState<Product | null>(null);
  const [showGastroCheckout, setShowGastroCheckout] = useState(false);
  const [showTableReservation, setShowTableReservation] = useState(false);
  const gastroOrderType = useGastroCartStore((s) => s.orderType);
  const gastroTableNumber = useGastroCartStore((s) => s.tableNumber);
  const setGastroOrderType = useGastroCartStore((s) => s.setOrderType);
  const setGastroTableNumber = useGastroCartStore((s) => s.setTableNumber);
  const addGastroItem = useGastroCartStore((s) => s.addItem);
  const activeOrderNumber = useGastroCartStore((s) => s.activeOrderNumber);
  const activeOrderSlug = useGastroCartStore((s) => s.activeOrderSlug);
  const gastroCartCount = useGastroCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  /** Format price using tenant's default currency */
  const formatPrice = (price: number, currency?: string) => _formatPrice(price, currency || tenantCurrency);
  const mobileColumns = settings?.mobileColumns ?? branding?.mobileColumns ?? 2;

  // Ad limits: max banners based on product count (min 1 if showAds)
  const totalProducts = products.length;
  const maxAds = !showAds ? 0 : totalProducts >= 24 ? 3 : totalProducts >= 12 ? 2 : 1;

  // Fetch payment methods on mount
  useEffect(() => {
    publicApi.getPaymentMethods(slug)
      .then(pm => setHasMercadoPago(pm.mercadopago))
      .catch(() => {});
  }, [slug]);

  // Gastro scroll-spy: observe category sections and highlight nearest
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = Object.entries(gastroSectionRefs.current).filter(([, el]) => el) as [string, HTMLElement][];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target.getBoundingClientRect().top) - (b.target.getBoundingClientRect().top));
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset.gastroCat;
          if (id) setGastroActiveCat(id);
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [products, categories]);

  // Gastro: center active nav button horizontally — only scrolls the nav container, never the page
  useEffect(() => {
    if (!gastroActiveCat) return;
    const btn = gastroNavRefs.current[gastroActiveCat];
    if (!btn) return;
    const scroller = btn.parentElement;
    if (!scroller) return;
    const target = btn.offsetLeft - (scroller.clientWidth / 2) + (btn.clientWidth / 2);
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  }, [gastroActiveCat]);

  // Load active sorteos
  const [activeSorteos, setActiveSorteos] = useState<any[]>([]);
  useEffect(() => {
    publicApi.getSorteos(slug).then(setActiveSorteos).catch(() => {});
  }, [slug]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [selectedProduct]);

  // ── Prefetch all product images on mount (Instagram-style) ──
  // Downloads all images in background so modal opens instantly
  useEffect(() => {
    if (!products?.length) return;
    const urls: string[] = [];
    for (const p of products) {
      if (p.images?.length) {
        for (const img of p.images) {
          if (img.url) urls.push(img.url);
        }
      }
    }
    if (!urls.length) return;
    // Prefetch in small batches to avoid blocking network
    let i = 0;
    const batch = 4;
    const prefetchBatch = () => {
      const end = Math.min(i + batch, urls.length);
      for (; i < end; i++) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = urls[i];
        document.head.appendChild(link);
      }
      if (i < urls.length) setTimeout(prefetchBatch, 100);
    };
    // Start prefetching after a small delay so initial render isn't blocked
    const timer = setTimeout(prefetchBatch, 500);
    return () => clearTimeout(timer);
  }, [products]);

  const getWhatsAppLink = (product: Product) => {
    const msg = encodeURIComponent(
      `Hola! Me interesa "${product.name}" (${formatPrice(Number(product.price), (product as any).currency)}). ¿Está disponible?`
    );
    return `https://wa.me/${whatsappNumber}?text=${msg}`;
  };

  // ── All filterable attribute keys (static, from full catalog) ──
  // Keys that should render as "Hasta X" range inputs instead of chip selectors
  const RANGE_FILTER_KEYS = useMemo(() => new Set([
    'sup_total', 'sup_cubierta', 'sup_terreno', 'superficie_total', 'superficie_cubierta', 'superficie_terreno',
    'expensas', 'frente', 'fondo', 'antiguedad',
  ]), []);
  // Keys to exclude entirely — too specific or redundant for filtering
  const EXCLUDE_FILTER_KEYS = useMemo(() => new Set([
    'codigo', 'code', 'direccion', 'address', 'situacion',
  ]), []);
  // Priority order for real estate: location → type → rooms → surface → misc
  const FILTER_PRIORITY: Record<string, number> = useMemo(() => ({
    ubicacion: 1, location: 1, zona: 1, barrio: 1, ciudad: 1,
    operacion: 5, tipo_operacion: 5,
    ambientes: 10, dormitorios: 11, banos: 12,
    cochera: 15, cocheras: 15, plantas: 16, pileta: 17,
    sup_total: 20, superficie_total: 20, sup_cubierta: 21, superficie_cubierta: 21,
    sup_terreno: 22, superficie_terreno: 22,
    orientacion: 30, disposicion: 31,
    expensas: 35,
    antiguedad: 40,
    estado: 42,
    frente: 45, fondo: 46,
  }), []);

  const allFilterKeys = useMemo(() => {
    const activeProds = products.filter(p => p.isActive);
    const keys: Array<{ key: string; label: string; isRange: boolean }> = [];
    const seen = new Set<string>();
    for (const p of activeProds) {
      const attrs = (p as any).attributes as ProductAttribute[] | null;
      if (!attrs?.length) continue;
      for (const a of attrs) {
        if (!a.value || a.type === 'boolean' || a.type === 'multiselect') continue;
        if (EXCLUDE_FILTER_KEYS.has(a.key.toLowerCase())) continue;
        const isRange = RANGE_FILTER_KEYS.has(a.key.toLowerCase());
        if (a.type === 'number' && !isRange && !['ambientes', 'dormitorios', 'banos'].includes(a.key)) continue;
        if (!seen.has(a.key)) { seen.add(a.key); keys.push({ key: a.key, label: a.label, isRange }); }
      }
    }
    // Sort by priority (known keys first, unknowns last at 100)
    keys.sort((a, b) => (FILTER_PRIORITY[a.key.toLowerCase()] ?? 100) - (FILTER_PRIORITY[b.key.toLowerCase()] ?? 100));
    return keys;
  }, [products, RANGE_FILTER_KEYS, EXCLUDE_FILTER_KEYS, FILTER_PRIORITY]);

  // ── Cascading filters: each filter's options are based on products matching ALL OTHER filters ──
  const filterOptions = useMemo(() => {
    const activeProds = products.filter(p => p.isActive);

    // Parse numeric value from attribute string (e.g. "120 m²" → 120, "$15.000" → 15000)
    const parseNumeric = (val: string): number | null => {
      const cleaned = val.replace(/[$.m²mts\s]/g, '').replace(/\./g, '').replace(',', '.');
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    };

    // Helper: filter products by everything EXCEPT the excluded filter key
    const filterExcluding = (excludeKey: string | null) => {
      return activeProds
        .filter(p => !activeCategories.length || activeCategories.includes(p.categoryId!))
        .filter(p => {
          if (!search) return true;
          const q = search.toLowerCase();
          return p.name.toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
        })
        .filter(p => {
          const attrs = (p as any).attributes as ProductAttribute[] | null;
          for (const [key, vals] of Object.entries(attrFilters)) {
            if (key === excludeKey || !vals?.length) continue;
            const attr = attrs?.find(a => a.key === key);
            if (!attr || !vals.includes(attr.value)) return false;
          }
          // Apply range bucket filters
          for (const [key, bucketId] of Object.entries(rangeFilters)) {
            if (key === excludeKey || !bucketId) continue;
            const [bMinStr, bMaxStr] = bucketId.split('-');
            const bMin = Number(bMinStr);
            const bMax = bMaxStr === 'Infinity' ? Infinity : Number(bMaxStr);
            const attr = attrs?.find(a => a.key === key);
            if (!attr?.value) return false;
            const numVal = parseNumeric(attr.value);
            if (numVal === null) continue;
            if (numVal < bMin || (bMax !== Infinity && numVal > bMax)) return false;
          }
          return true;
        })
        .filter(p => {
          if (excludeKey === '_price') return true;
          const price = Number(p.price);
          if (priceRange[0] !== null && price < priceRange[0]) return false;
          if (priceRange[1] !== null && price > priceRange[1]) return false;
          return true;
        });
    };

    // Build cascading options for each attribute
    const chipAttrs: Array<{ key: string; label: string; options: Array<{ value: string; count: number }> }> = [];
    const rangeAttrs: Array<{ key: string; label: string; unit: string; buckets: Array<{ label: string; id: string; min: number; max: number; count: number }> }> = [];

    // Generate smart range buckets from data
    const makeBuckets = (nums: number[], unit: string, key: string): Array<{ label: string; id: string; min: number; max: number }> => {
      if (!nums.length) return [];
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const range = max - min;
      if (range === 0) return [];

      // Choose step size based on the data type and range
      let steps: number[];
      const kl = key.toLowerCase();
      if (/sup|superficie|terreno/i.test(kl)) {
        // Surface: 50, 100, 150, 200, 300, 500, 1000+
        if (max <= 200) steps = [50, 100, 150, 200];
        else if (max <= 500) steps = [50, 100, 200, 300, 500];
        else steps = [100, 200, 500, 1000, 2000, 5000, 10000];
      } else if (/expensas/i.test(kl)) {
        if (max <= 100000) steps = [20000, 50000, 80000, 100000];
        else if (max <= 500000) steps = [50000, 100000, 200000, 300000, 500000];
        else steps = [100000, 200000, 500000, 1000000];
      } else if (/frente|fondo/i.test(kl)) {
        steps = [10, 20, 30, 50, 100];
      } else if (/antiguedad/i.test(kl)) {
        steps = [1, 5, 10, 20, 30, 50];
      } else {
        // Generic: divide into ~4-5 buckets
        const step = Math.pow(10, Math.floor(Math.log10(range / 4)));
        const roundedStep = Math.ceil(range / 4 / step) * step;
        steps = [];
        for (let v = Math.ceil(min / roundedStep) * roundedStep; v <= max; v += roundedStep) steps.push(v);
      }

      // Build bucket list: "Hasta X", "X-Y", "X+"
      const buckets: Array<{ label: string; id: string; min: number; max: number }> = [];
      const relevantSteps = steps.filter(s => s > min && s < max);

      if (relevantSteps.length === 0) return [];

      // "Hasta [first step]"
      const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toLocaleString('es-AR')}k` : n.toLocaleString('es-AR');
      const fmtLabel = (n: number, u: string) => /expensas/i.test(kl) ? `$${fmtNum(n)}` : `${fmtNum(n)} ${u}`.trim();
      const antLabels: Record<number, string> = { 1: 'A estrenar', 5: 'Hasta 5 años', 10: 'Hasta 10 años', 20: 'Hasta 20 años', 30: 'Hasta 30 años', 50: 'Hasta 50 años' };

      if (/antiguedad/i.test(kl)) {
        for (const s of relevantSteps) {
          buckets.push({ label: antLabels[s] || `Hasta ${s} años`, id: `0-${s}`, min: 0, max: s });
        }
        buckets.push({ label: `Más de ${relevantSteps[relevantSteps.length - 1]} años`, id: `${relevantSteps[relevantSteps.length - 1]}-Infinity`, min: relevantSteps[relevantSteps.length - 1], max: Infinity });
      } else {
        buckets.push({ label: `Hasta ${fmtLabel(relevantSteps[0], unit)}`, id: `0-${relevantSteps[0]}`, min: 0, max: relevantSteps[0] });
        for (let i = 0; i < relevantSteps.length - 1; i++) {
          buckets.push({ label: `${fmtLabel(relevantSteps[i], unit)} a ${fmtLabel(relevantSteps[i + 1], unit)}`, id: `${relevantSteps[i]}-${relevantSteps[i + 1]}`, min: relevantSteps[i], max: relevantSteps[i + 1] });
        }
        buckets.push({ label: `Más de ${fmtLabel(relevantSteps[relevantSteps.length - 1], unit)}`, id: `${relevantSteps[relevantSteps.length - 1]}-Infinity`, min: relevantSteps[relevantSteps.length - 1], max: Infinity });
      }
      return buckets;
    };

    for (const { key, label, isRange } of allFilterKeys) {
      const pool = filterExcluding(key);

      if (isRange) {
        // Range filter: compute buckets from available values
        const nums: number[] = [];
        for (const p of pool) {
          const attrs = (p as any).attributes as ProductAttribute[] | null;
          const a = attrs?.find(x => x.key === key);
          if (a?.value) { const n = parseNumeric(a.value); if (n !== null && n > 0) nums.push(n); }
        }
        if (nums.length < 2) continue;
        const unit = /sup|superficie|terreno/i.test(key) ? 'm²' : /expensas/i.test(key) ? '$' : /frente|fondo/i.test(key) ? 'mts' : '';
        const rawBuckets = makeBuckets(nums, unit, key);
        // Count how many products fall in each bucket
        const buckets = rawBuckets.map(b => {
          const count = nums.filter(n => n >= b.min && (b.max === Infinity ? true : n <= b.max)).length;
          return { ...b, count };
        }).filter(b => b.count > 0);  // Hide empty buckets
        if (buckets.length < 2) continue;
        rangeAttrs.push({ key, label, unit, buckets });
      } else {
        // Chip filter: discrete values
        const values = new Map<string, number>();
        for (const p of pool) {
          const attrs = (p as any).attributes as ProductAttribute[] | null;
          const a = attrs?.find(x => x.key === key);
          if (a?.value) values.set(a.value, (values.get(a.value) || 0) + 1);
        }
        if (values.size < 2) continue;
        const valKeys = Array.from(values.keys());
        const maxLen = Math.max(...valKeys.map(v => v.length));
        if (maxLen > 50) continue;
        if (values.size > 30) continue;
        // Filter out zero-count options (unless currently selected)
        const selectedVals = attrFilters[key] || [];
        const opts = Array.from(values.entries())
          .filter(([v, c]) => c > 0 || selectedVals.includes(v))
          .map(([v, c]) => ({ value: v, count: c }))
          .sort((a, b) => b.count - a.count);
        if (opts.length < 2 && !selectedVals.length) continue;
        chipAttrs.push({ key, label, options: opts });
      }
    }

    // Price range from current filtered set (excluding price filter)
    const pricePool = filterExcluding('_price');
    const prices = pricePool.map(p => Number(p.price)).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return { attributes: chipAttrs, rangeAttributes: rangeAttrs, minPrice, maxPrice };
  }, [products, activeCategories, search, attrFilters, rangeFilters, priceRange, allFilterKeys]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (activeCategories.length) c++;
    if (search) c++;
    for (const v of Object.values(attrFilters)) { if (v?.length) c++; }
    for (const v of Object.values(rangeFilters)) { if (v) c++; }
    if (priceRange[0] !== null || priceRange[1] !== null) c++;
    return c;
  }, [activeCategories, search, attrFilters, rangeFilters, priceRange]);

  // ── Unified product filter (category + search + attributes + price) ──
  const applyFilters = useCallback((list: Product[]) => {
    return list
      .filter(p => p.isActive)
      .filter(p => !activeCategories.length || activeCategories.includes(p.categoryId!))
      .filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      })
      .filter(p => {
        // Attribute chip filters
        const attrs = (p as any).attributes as ProductAttribute[] | null;
        for (const [key, vals] of Object.entries(attrFilters)) {
          if (!vals?.length) continue;
          const attr = attrs?.find(a => a.key === key);
          if (!attr || !vals.includes(attr.value)) return false;
        }
        // Attribute range bucket filters
        for (const [key, bucketId] of Object.entries(rangeFilters)) {
          if (!bucketId) continue;
          const [bMinStr, bMaxStr] = bucketId.split('-');
          const bMin = Number(bMinStr);
          const bMax = bMaxStr === 'Infinity' ? Infinity : Number(bMaxStr);
          const attr = attrs?.find(a => a.key === key);
          if (!attr?.value) return false;
          const cleaned = attr.value.replace(/[$.m²mts\s]/g, '').replace(/\./g, '').replace(',', '.');
          const numVal = parseFloat(cleaned);
          if (isNaN(numVal)) continue;
          if (numVal < bMin || (bMax !== Infinity && numVal > bMax)) return false;
        }
        return true;
      })
      .filter(p => {
        // Price range
        const price = Number(p.price);
        if (priceRange[0] !== null && price < priceRange[0]) return false;
        if (priceRange[1] !== null && price > priceRange[1]) return false;
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activeCategories, search, attrFilters, rangeFilters, priceRange]);

  // Transform products to service-like objects for PublicServiceCard
  const productAsServices = useMemo(() => {
    return applyFilters(products)
      .map(p => {
        const primaryImage = p.images?.find(i => i.isPrimary) || p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          description: p.shortDescription || p.description || null,
          price: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price)
            ? Number(p.compareAtPrice)
            : (Number(p.price) || null),
          duration: 0,
          image: primaryImage?.url || null,
          images: p.images?.map(i => i.url) || [],
          imageDisplayMode: 'cover',
          includes: null,
          promoPrice: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) ? Number(p.price) : null,
          promoLabel: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) ? 'Oferta' : null,
          _product: p,
        };
      });
  }, [products, applyFilters]);

  // Filtered products for compact mobile cards
  const filteredProducts = useMemo(() => applyFilters(products), [products, applyFilters]);
  const featuredProducts = useMemo(() => filteredProducts.filter(p => p.isFeatured), [filteredProducts]);
  const regularProducts = useMemo(() => filteredProducts.filter(p => !p.isFeatured), [filteredProducts]);

  const resultsRef = useRef<HTMLDivElement>(null);

  const clearAllFilters = () => {
    setSearch('');
    setActiveCategories([]);
    setAttrFilters({});
    setRangeFilters({});
    setPriceRange([null, null]);
  };

  const applyAndScroll = () => {
    setShowFilters(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleProductSelect = (service: any) => {
    setSelectedProduct(service._product as Product);
  };

  const handleShowDetail = (service: any) => {
    setSelectedProduct(service._product as Product);
  };

  const shippingConfig = (settings?.shipping || null) as ShippingConfig | null;

  // Gastro pages use a fixed clean style (like the tracking page) — no Apariencia variability
  const fixedGastroStyle = isGastro;

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={{
        primaryColor,
        secondaryColor: settings?.secondaryColor || branding?.secondaryColor,
        accentColor: settings?.accentColor || branding?.accentColor,
      }}
      enableDarkMode={settings?.enableDarkMode ?? true}
      themeMode={settings?.themeMode}
    >
      {/* Theme Toggle — visible when tenant allows both modes */}
      {(settings?.themeMode === 'both' || (!settings?.themeMode && settings?.enableDarkMode !== false)) && (
        <PublicThemeToggleFloating
          tenantSlug={slug}
          className="fixed top-4 right-4 bottom-auto h-10 w-10"
        />
      )}

      <div className={`relative min-h-screen overflow-x-hidden ${fixedGastroStyle ? 'bg-gray-50 dark:bg-neutral-950' : 'bg-white dark:bg-neutral-950'}`}>
        {/* Background style pattern — disabled for gastro (clean look) */}
        {!fixedGastroStyle && <BackgroundStyles style={settings?.backgroundStyle || 'modern'} className="z-0" />}

        {/* Hero — gastro gets taller cover + fixed clean style */}
        <PublicHero
          tenant={tenant}
          reputationStats={null}
          heroStyle={fixedGastroStyle ? 'classic' : ((settings?.heroStyle as HeroStyleName) || 'classic')}
          heroButtons={settings?.heroButtons}
          isCatalog
          coverSettings={{
            showProfilePhoto: settings?.showProfilePhoto,
            coverOverlayColor: fixedGastroStyle ? '#000000' : settings?.coverOverlayColor,
            coverOverlayOpacity: fixedGastroStyle ? 40 : settings?.coverOverlayOpacity,
            coverFadeEnabled: fixedGastroStyle ? false : settings?.coverFadeEnabled,
            coverFadeColor: settings?.coverFadeColor,
            heroTextTone: fixedGastroStyle ? 'light' : settings?.heroTextTone,
            heroTrustTone: fixedGastroStyle ? 'light' : settings?.heroTrustTone,
          }}
          logoScale={branding?.logoScale ?? settings?.logoScale}
          logoOffsetX={branding?.logoOffsetX ?? settings?.logoOffsetX}
          logoOffsetY={branding?.logoOffsetY ?? settings?.logoOffsetY}
          tallHero={fixedGastroStyle}
        />

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

          {/* ── Section Tabs: Propiedades / Desarrollos ── */}
          {developments.length > 0 && !isGastro && (
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50 shadow-sm">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'properties'
                        ? 'text-white shadow-md'
                        : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
                    }`}
                    style={activeTab === 'properties' ? {
                      backgroundColor: primaryColor,
                      boxShadow: `0 2px 12px ${primaryColor}35`,
                    } : undefined}
                  >
                    <Search className="h-4 w-4" />
                    Propiedades
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      activeTab === 'properties' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400'
                    }`}>
                      {products.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('developments')}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'developments'
                        ? 'text-white shadow-md'
                        : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
                    }`}
                    style={activeTab === 'developments' ? {
                      backgroundColor: primaryColor,
                      boxShadow: `0 2px 12px ${primaryColor}35`,
                    } : undefined}
                  >
                    <HardHat className="h-4 w-4" />
                    Desarrollos
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      activeTab === 'developments' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400'
                    }`}>
                      {developments.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Gastro: Order Mode + Reserve Table ── */}
          {isGastro && (
            <div className="mb-6 max-w-md mx-auto space-y-3">
              <OrderModeSelector
                orderType={gastroOrderType}
                onSelectType={setGastroOrderType}
                primaryColor={primaryColor}
                showReservation={settings?.enableReservations !== false}
                onReserveTable={() => setShowTableReservation(true)}
              />
            </div>
          )}

          {/* ── TAB: Properties ── */}
          {(activeTab === 'properties' || !developments.length) && <>

          {/* ── Search + Interactive Filter Bar ── */}
          <div className="mb-8 space-y-3">
            {/* Search + Filter toggle row */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-sm focus:outline-none transition-all duration-200"
                  style={{
                    boxShadow: search ? `0 0 0 2px ${primaryColor}40` : '0 1px 3px rgba(0,0,0,0.06)',
                    borderColor: search ? primaryColor : undefined,
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <X className="h-3 w-3 text-slate-500 dark:text-neutral-400" />
                  </button>
                )}
              </div>
              {/* Filter toggle button */}
              {(filterOptions.attributes.length > 0 || categories.length > 0) && (
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
                    showFilters || activeFilterCount > 0 ? '' : 'bg-white/90 dark:bg-neutral-800/90 border-slate-200/60 dark:border-neutral-700/60 text-slate-700 dark:text-neutral-200'
                  }`}
                  style={{
                    ...(showFilters || activeFilterCount > 0 ? {
                      backgroundColor: primaryColor,
                      color: '#fff',
                      borderColor: primaryColor,
                      boxShadow: `0 2px 8px ${primaryColor}30`,
                    } : {
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }),
                  }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFilterCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[11px] font-bold leading-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* ── Expandable filter panel — chip-based, no dropdowns ── */}
            {showFilters && (
              <div
                className="max-w-2xl mx-auto rounded-2xl border p-4 animate-in slide-in-from-top-2 duration-200 bg-white/95 dark:bg-neutral-900/95 border-slate-200/50 dark:border-neutral-700/50"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              >
                {/* ── Apply + Clear — TOP bar (sticky) ── */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50 dark:border-neutral-700/50 sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 -mt-0">
                  {activeFilterCount > 0 ? (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-medium transition-colors active:opacity-70 text-slate-600 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      Limpiar filtros
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-neutral-500">
                      {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={applyAndScroll}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 2px 10px ${primaryColor}40`,
                    }}
                  >
                    Ver {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Category chips — hide categories with 0 results */}
                {categories.length > 0 && (() => {
                  const catsWithCount = categories.map(cat => {
                    const isActive = activeCategories.includes(cat.id);
                    const count = products.filter(p => {
                      if (!p.isActive) return false;
                      if (p.categoryId !== cat.id) return false;
                      if (search) {
                        const q = search.toLowerCase();
                        if (!p.name.toLowerCase().includes(q) && !(p.shortDescription || '').toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) return false;
                      }
                      const attrs = (p as any).attributes as ProductAttribute[] | null;
                      for (const [key, vals] of Object.entries(attrFilters)) {
                        if (!vals?.length) continue;
                        const attr = attrs?.find(a => a.key === key);
                        if (!attr || !vals.includes(attr.value)) return false;
                      }
                      const price = Number(p.price);
                      if (priceRange[0] !== null && price < priceRange[0]) return false;
                      if (priceRange[1] !== null && price > priceRange[1]) return false;
                      return true;
                    }).length;
                    return { cat, count, isActive };
                  }).filter(c => c.count > 0 || c.isActive); // Hide zero-count unless active
                  if (catsWithCount.length < 2 && !activeCategories.length) return null;
                  return (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                        Categoría
                        {activeCategories.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                            {activeCategories.length}
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {catsWithCount.map(({ cat, count, isActive }) => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategories(prev => isActive ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 active:scale-95 ${
                              isActive ? '' : 'bg-transparent border-slate-200/50 dark:border-neutral-600/50 text-slate-700 dark:text-neutral-300'
                            }`}
                            style={isActive ? { backgroundColor: primaryColor, color: '#fff', borderColor: primaryColor } : {}}
                          >
                            {isActive && <Check className="h-3 w-3" />}
                            {cat.name}
                            <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400 dark:text-neutral-500'}`}>({count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Dynamic chip attribute filters — hide zero-count options */}
                {filterOptions.attributes.map(attr => {
                  const selectedVals = attrFilters[attr.key] || [];
                  const toggleVal = (val: string) => {
                    setAttrFilters(f => {
                      const current = f[attr.key] || [];
                      const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
                      return { ...f, [attr.key]: next };
                    });
                  };
                  return (
                    <div key={attr.key} className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                        {attr.label}
                        {selectedVals.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                            {selectedVals.length}
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.options.map(opt => {
                          const isSelected = selectedVals.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggleVal(opt.value)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 active:scale-95 ${
                                isSelected ? '' : 'bg-transparent border-slate-200/50 dark:border-neutral-600/50 text-slate-700 dark:text-neutral-300'
                              }`}
                              style={isSelected ? { backgroundColor: primaryColor, color: '#fff', borderColor: primaryColor } : {}}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {opt.value}
                              <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-neutral-500'}`}>({opt.count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Range attribute filters — clickable bucket chips (ML-style) */}
                {filterOptions.rangeAttributes.map(ra => {
                  const selectedBucket = rangeFilters[ra.key] || null;
                  return (
                    <div key={ra.key} className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                        {ra.label}
                        {selectedBucket && (
                          <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                            1
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ra.buckets.map(b => {
                          const isSelected = selectedBucket === b.id;
                          return (
                            <button
                              key={b.id}
                              onClick={() => setRangeFilters(prev => ({ ...prev, [ra.key]: isSelected ? null : b.id }))}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 active:scale-95 ${
                                isSelected ? '' : 'bg-transparent border-slate-200/50 dark:border-neutral-600/50 text-slate-700 dark:text-neutral-300'
                              }`}
                              style={isSelected ? { backgroundColor: primaryColor, color: '#fff', borderColor: primaryColor } : {}}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {b.label}
                              <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-neutral-500'}`}>({b.count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Price range — keep as input since prices vary too widely (USD/ARS) */}
                {filterOptions.maxPrice > filterOptions.minPrice && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Precio
                      {(priceRange[0] !== null || priceRange[1] !== null) && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                          1
                        </span>
                      )}
                    </span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Desde"
                        value={priceRange[0] ?? ''}
                        onChange={e => setPriceRange([e.target.value ? Number(e.target.value) : null, priceRange[1]])}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-600 bg-transparent text-xs text-slate-700 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none"
                        style={{ borderColor: priceRange[0] !== null ? primaryColor : undefined }}
                      />
                      <span className="text-slate-400 dark:text-neutral-500 text-xs shrink-0">—</span>
                      <input
                        type="number"
                        placeholder="Hasta"
                        value={priceRange[1] ?? ''}
                        onChange={e => setPriceRange([priceRange[0], e.target.value ? Number(e.target.value) : null])}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-600 bg-transparent text-xs text-slate-700 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none"
                        style={{ borderColor: priceRange[1] !== null ? primaryColor : undefined }}
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Filter chips now shown in the section header above */}
          </div>

          {/* Section Header + Filter result bar */}
          <div ref={resultsRef} className="text-center mb-6 md:mb-10 scroll-mt-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              {activeCategories.length === 1
                ? `${categories.find(c => c.id === activeCategories[0])?.name || 'Productos'}`
                : 'Nuestros Productos'}
            </h2>
            {activeFilterCount > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-300 dark:text-neutral-600">·</span>
                {activeCategories.map(catId => (
                  <span key={catId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                    {categories.find(c => c.id === catId)?.name}
                    <button onClick={() => setActiveCategories(prev => prev.filter(id => id !== catId))} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                {Object.entries(attrFilters).filter(([, v]) => v?.length).map(([key, vals]) => (
                  <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                    {vals.length === 1 ? vals[0] : `${filterOptions.attributes.find(a => a.key === key)?.label || key}: ${vals.length}`}
                    <button onClick={() => setAttrFilters(f => ({ ...f, [key]: [] }))} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                {Object.entries(rangeFilters).filter(([, v]) => !!v).map(([key, bucketId]) => {
                  const ra = filterOptions.rangeAttributes.find(r => r.key === key);
                  const bucket = ra?.buckets.find(b => b.id === bucketId);
                  return (
                    <span key={`range-${key}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                      {ra?.label}: {bucket?.label || bucketId}
                      <button onClick={() => setRangeFilters(f => ({ ...f, [key]: null }))} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  );
                })}
                {(priceRange[0] !== null || priceRange[1] !== null) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                    {priceRange[0] !== null && priceRange[1] !== null ? `$${priceRange[0].toLocaleString()}-$${priceRange[1].toLocaleString()}` : priceRange[0] !== null ? `Desde $${priceRange[0].toLocaleString()}` : `Hasta $${priceRange[1]!.toLocaleString()}`}
                    <button onClick={() => setPriceRange([null, null])} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch('')} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                <button onClick={clearAllFilters} className="text-[11px] underline underline-offset-2 ml-1 transition-colors active:opacity-70 text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  Limpiar
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isGastro
                  ? 'Armá tu pedido y elegí cómo querés recibirlo'
                  : whatsappNumber
                    ? 'Elegí un producto y consultanos por WhatsApp'
                    : 'Explorá nuestro catálogo de productos'}
              </p>
            )}
          </div>

          {/* ═══ Featured Products — full-width premium cards (NOT for gastro) ═══ */}
          {!isGastro && featuredProducts.length > 0 && (
            <div className="space-y-4 mb-6 sm:mb-8">
              {featuredProducts.map((product) => {
                const allImgs = product.images?.length > 0
                  ? [product.images.find(i => i.isPrimary) || product.images[0], ...product.images.filter(i => !i.isPrimary)].filter(Boolean)
                  : [];
                const price = Number(product.price) || 0;
                const pCurrency = product.currency || tenantCurrency;
                const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
                const hasDiscount = comparePrice != null && comparePrice > price;
                const discountPct = hasDiscount ? Math.round((1 - price / comparePrice!) * 100) : 0;
                const showPrices = settings?.showPrices ?? true;

                return (
                  <div
                    key={product.id}
                    onClick={() => isGastro ? setGastroProduct(product) : setSelectedProduct(product)}
                    className="group relative w-full cursor-pointer"
                  >
                    {/* Glow effect behind card */}
                    <div className="absolute -inset-px rounded-[18px] sm:rounded-[22px] bg-gradient-to-br from-amber-400/30 via-[hsl(var(--tenant-primary-400)_/_0.2)] to-amber-400/30 dark:from-amber-500/20 dark:via-[hsl(var(--tenant-primary-500)_/_0.15)] dark:to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

                    <div className="relative overflow-hidden rounded-2xl sm:rounded-[20px] border border-amber-200/50 dark:border-amber-700/30 bg-white dark:bg-neutral-800/95 shadow-[0_2px_16px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-none dark:group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300">
                      {/* Subtle golden top accent */}
                      <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-amber-300 to-[hsl(var(--tenant-primary-400))]" />

                      <div className="flex flex-col sm:flex-row">
                        {/* ── Image section ── */}
                        <div className="relative sm:w-[42%] lg:w-[38%] shrink-0 overflow-hidden">
                          {allImgs.length > 0 ? (
                            <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[200px]">
                              <Image src={allImgs[0].url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, 42vw" />
                              {/* Subtle gradient for text contrast on mobile */}
                              <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                          ) : (
                            <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[200px] bg-gradient-to-br from-amber-50/80 to-slate-50 dark:from-amber-950/20 dark:to-neutral-800 flex items-center justify-center">
                              <Package className="h-12 w-12 text-amber-200 dark:text-amber-900/40" />
                            </div>
                          )}
                          {/* Discount badge */}
                          {hasDiscount && (
                            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold shadow-lg shadow-red-500/20">
                                <Tag className="h-3 w-3" />-{discountPct}%
                              </span>
                            </div>
                          )}
                          {/* Image count — desktop only */}
                          {allImgs.length > 1 && (
                            <div className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium">
                              <ZoomIn className="h-3 w-3" />
                              {allImgs.length} fotos
                            </div>
                          )}
                        </div>

                        {/* ── Content section ── */}
                        <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col min-w-0">
                          {/* Top: badge + category */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/25 dark:to-amber-800/15 border border-amber-200/60 dark:border-amber-700/30">
                              <svg className="h-3 w-3 fill-amber-500 drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 tracking-wide">DESTACADO</span>
                            </span>
                            {product.category && (
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">{product.category.name}</span>
                            )}
                          </div>

                          {/* Name */}
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[hsl(var(--tenant-primary-600))] dark:group-hover:text-[hsl(var(--tenant-primary-400))] transition-colors line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Description */}
                          {(product.shortDescription || product.description) && (
                            <p className="text-[13px] text-slate-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">{stripHtml(product.shortDescription || product.description || '')}</p>
                          )}

                          {/* Attributes — compact inline (short values only) */}
                          {product.attributes && product.attributes.length > 0 && (() => {
                            const shortAttrs = product.attributes.filter((a: ProductAttribute) => a.value && a.value.length <= 30 && !a.value.includes(',') && !(/^situacion$/i.test(a.key || '') && /^vac[ií]a$/i.test(a.value.trim())));
                            const remaining = product.attributes.length - shortAttrs.length;
                            return shortAttrs.length > 0 ? (
                              <div className="mt-2.5 hidden sm:flex flex-wrap gap-1.5">
                                {shortAttrs.slice(0, 4).map((attr: ProductAttribute, i: number) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 dark:bg-neutral-700/30 text-[10px]">
                                    <span className="text-slate-400 dark:text-neutral-500 mr-1">{attr.label}:</span>
                                    <span className="font-semibold text-slate-600 dark:text-neutral-300">{attr.value}</span>
                                  </span>
                                ))}
                                {(shortAttrs.length > 4 || remaining > 0) && (
                                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 self-center">+{shortAttrs.length - 4 + remaining} más</span>
                                )}
                              </div>
                            ) : null;
                          })()}

                          {/* Spacer */}
                          <div className="flex-1 min-h-[8px]" />

                          {/* Price + CTA row */}
                          <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-slate-100/80 dark:border-neutral-700/30">
                            <div>
                              {showPrices && price > 0 ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">{formatPrice(price, pCurrency)}</span>
                                  {hasDiscount && (
                                    <span className="text-xs text-slate-400 dark:text-neutral-500 line-through">{formatPrice(comparePrice!, pCurrency)}</span>
                                  )}
                                </div>
                              ) : !showPrices ? null : (
                                <span className="text-sm font-medium text-slate-400 dark:text-neutral-500">Consultar precio</span>
                              )}
                              {hasDiscount && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">Ahorrás {formatPrice(comparePrice! - price, pCurrency)}</span>
                              )}
                            </div>
                            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--tenant-primary-500)_/_0.08)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.15)] text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] text-xs font-bold group-hover:bg-[hsl(var(--tenant-primary-500)_/_0.15)] dark:group-hover:bg-[hsl(var(--tenant-primary-500)_/_0.25)] transition-colors shrink-0">
                              Ver producto
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ Gastro: sticky scroll-spy menu navigation (senior restaurant pattern) ═══ */}
          {isGastro && categories.length > 0 && (() => {
            const activeProducts = products.filter(p => p.isActive);
            const catsWithCount = categories
              .map(c => ({ ...c, count: activeProducts.filter(p => p.categoryId === c.id).length }))
              .filter(c => c.count > 0);
            if (catsWithCount.length === 0) return null;
            const scrollToCat = (id: string) => {
              const el = gastroSectionRefs.current[id];
              if (!el) return;
              const y = el.getBoundingClientRect().top + window.scrollY - 96;
              window.scrollTo({ top: y, behavior: 'smooth' });
            };
            return (
              <div className="sticky top-0 z-30 -mx-4 px-4 mb-5 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-slate-200/70 dark:border-neutral-800/80">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                  {catsWithCount.map((cat: any) => {
                    const isActive = gastroActiveCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        ref={(el) => { gastroNavRefs.current[cat.id] = el; }}
                        type="button"
                        onClick={() => scrollToCat(cat.id)}
                        className="group relative shrink-0 px-4 py-2 text-[13px] sm:text-sm font-medium tracking-wide whitespace-nowrap transition-colors"
                        style={{ color: isActive ? primaryColor : undefined }}
                      >
                        <span className={isActive ? 'font-semibold' : 'text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white'}>
                          {cat.name}
                        </span>
                        <span className="ml-1.5 text-[10px] tabular-nums opacity-50">{cat.count}</span>
                        <span
                          className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full transition-all duration-300"
                          style={{ background: primaryColor, opacity: isActive ? 1 : 0, transform: isActive ? 'scaleX(1)' : 'scaleX(0.4)' }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ═══ Gastro layout: featured 2-col + regular horizontal cards ═══ */}
          {isGastro && (featuredProducts.length > 0 || regularProducts.length > 0) && (
            <div className="space-y-6">
              {featuredProducts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-500">★</span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400">Destacados</h2>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-700/60" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {featuredProducts.map((product) => {
                      const img = product.images?.find(i => i.isPrimary) || product.images?.[0];
                      const price = Number(product.price) || 0;
                      const pCurrency = product.currency || tenantCurrency;
                      const showPrices = settings?.showPrices ?? true;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setGastroProduct(product)}
                          className="group flex flex-col text-left bg-white dark:bg-neutral-800 rounded-2xl border border-amber-200/60 dark:border-amber-700/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                        >
                          <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-neutral-700/40">
                            {img ? (
                              <Image src={img.url} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="(max-width: 640px) 50vw, 33vw" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-slate-300 dark:text-neutral-600" /></div>
                            )}
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-white text-[10px] font-bold shadow-sm">★ Destacado</span>
                          </div>
                          <div className="p-3 flex flex-col gap-1">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{product.name}</h3>
                            {(product.shortDescription || product.description) && (
                              <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2 leading-snug">{stripHtml(product.shortDescription || product.description || '')}</p>
                            )}
                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 dark:border-neutral-700/60">
                              {showPrices && price > 0 ? (
                                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(price, pCurrency)}</span>
                              ) : <span />}
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--tenant-primary-500))] text-white text-base leading-none shadow-sm">+</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {regularProducts.length > 0 && (() => {
                // Group regular products by category, preserving category order
                const byCat = new Map<string, { cat: any; items: typeof regularProducts }>();
                const uncategorized: typeof regularProducts = [];
                regularProducts.forEach((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  if (!cat) { uncategorized.push(p); return; }
                  if (!byCat.has(cat.id)) byCat.set(cat.id, { cat, items: [] });
                  byCat.get(cat.id)!.items.push(p);
                });
                const groups: { id: string; name: string; description?: string | null; items: typeof regularProducts }[] = [];
                categories.forEach((c) => {
                  const g = byCat.get(c.id);
                  if (g) groups.push({ id: c.id, name: c.name, description: (c as any).description, items: g.items });
                });
                if (uncategorized.length) groups.push({ id: '__uncat', name: 'Otros', items: uncategorized });

                const renderProduct = (product: any) => {
                  const img = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
                  const price = Number(product.price) || 0;
                  const pCurrency = product.currency || tenantCurrency;
                  const showPrices = settings?.showPrices ?? true;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setGastroProduct(product)}
                      className="group flex items-stretch text-left bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200/80 dark:border-neutral-700/60 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-600 transition-all overflow-hidden"
                    >
                      <div className="relative w-28 sm:w-32 md:w-36 aspect-square shrink-0 bg-slate-100 dark:bg-neutral-700/40">
                        {img ? (
                          <Image src={img.url} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="144px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-7 h-7 text-slate-300 dark:text-neutral-600" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1">{product.name}</h3>
                        {(product.shortDescription || product.description) && (
                          <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-snug mt-1">{stripHtml(product.shortDescription || product.description || '')}</p>
                        )}
                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          {showPrices && price > 0 ? (
                            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(price, pCurrency)}</span>
                          ) : <span className="text-xs text-slate-400">Consultar</span>}
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--tenant-primary-500))] text-white text-xs font-semibold shadow-sm group-hover:shadow-md group-hover:scale-[1.03] transition-all">
                            Agregar
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                };

                return (
                  <div className="space-y-10">
                    {groups.map((g) => (
                      <section
                        key={g.id}
                        ref={(el) => { gastroSectionRefs.current[g.id] = el; }}
                        data-gastro-cat={g.id}
                        className="scroll-mt-24"
                      >
                        <header className="mb-4">
                          <div className="flex items-baseline gap-3">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{g.name}</h2>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500 tabular-nums">{g.items.length} {g.items.length === 1 ? 'plato' : 'platos'}</span>
                          </div>
                          {g.description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400 max-w-2xl">{stripHtml(g.description)}</p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="h-px w-10 rounded-full" style={{ background: primaryColor }} />
                            <span className="h-px flex-1 bg-slate-200/70 dark:bg-neutral-700/60" />
                          </div>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {g.items.map(renderProduct)}
                        </div>
                      </section>
                    ))}
                  </div>
                );
              })()}
              {false && (
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {regularProducts.map((product) => {
                      const img = product.images?.find(i => i.isPrimary) || product.images?.[0];
                      const price = Number(product.price) || 0;
                      const pCurrency = product.currency || tenantCurrency;
                      const showPrices = settings?.showPrices ?? true;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setGastroProduct(product)}
                          className="group flex items-stretch text-left bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200/80 dark:border-neutral-700/60 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-600 transition-all overflow-hidden"
                        >
                          <div className="relative w-28 sm:w-32 md:w-36 aspect-square shrink-0 bg-slate-100 dark:bg-neutral-700/40">
                            {img ? (
                              <Image src={img.url} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="144px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-7 h-7 text-slate-300 dark:text-neutral-600" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1">{product.name}</h3>
                            {(product.shortDescription || product.description) && (
                              <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-snug mt-1">{stripHtml(product.shortDescription || product.description || '')}</p>
                            )}
                            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                              {showPrices && price > 0 ? (
                                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(price, pCurrency)}</span>
                              ) : <span className="text-xs text-slate-400">Consultar</span>}
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--tenant-primary-500))] text-white text-xs font-semibold shadow-sm group-hover:shadow-md group-hover:scale-[1.03] transition-all">
                                Agregar
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Products Grid (NON-gastro: inmobiliarias/mercado/servicios) */}
          {!isGastro && regularProducts.length > 0 ? (
            <div className="relative md:p-4 lg:p-6">
              {/* Decorative background for desktop — subtle, respects theme */}
              <div className="hidden md:block absolute inset-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm rounded-3xl border border-slate-200/30 dark:border-neutral-700/30" />

              {/* ── Grid mode: 2 cols (mobile) / 3 cols (tablet+desktop) — styled compact cards ── */}
              {mobileColumns === 2 && (
                <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-5">
                  {regularProducts.map((product, _mobileIdx) => {
                    // Mobile (2 cols): after 4th product (2 full rows); Tablet/Desktop (3 cols): after 3rd (1 full row)
                    const _showSorteoMobile = _mobileIdx === 3 && activeSorteos.length > 0;
                    const _showSorteoDesktop = _mobileIdx === 2 && activeSorteos.length > 0;
                    const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
                    const price = Number(product.price) || 0;
                    const pCurrency = product.currency || tenantCurrency;
                    const fmtP = (v: number) => formatPrice(v, pCurrency);
                    const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
                    const hasDiscount = comparePrice != null && comparePrice > price;
                    const discountPct = hasDiscount ? Math.round((1 - price / comparePrice!) * 100) : 0;
                    const showPrices = settings?.showPrices ?? true;
                    const cs = fixedGastroStyle ? 'classic' as HeroStyleName : ((settings?.cardStyle as HeroStyleName) || (settings?.heroStyle as HeroStyleName) || 'classic');

                    // ── Style-aware classes per card variant ──
                    // Designed for maximum visual differentiation between styles
                    const cardCls = {
                      classic:    'bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200/80 dark:border-neutral-700/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1',
                      clinical:   'bg-white dark:bg-neutral-800 rounded-lg border-2 border-slate-200 dark:border-neutral-600 hover:border-[hsl(var(--tenant-primary-400))] dark:hover:border-[hsl(var(--tenant-primary-500))]',
                      bold:       'bg-neutral-100 dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 shadow-md',
                      zen:        'bg-white dark:bg-neutral-800 rounded-3xl border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800)_/_0.4)] hover:scale-[1.02] shadow-sm',
                      corporate:  'bg-slate-50 dark:bg-neutral-800 rounded-md border border-slate-300 dark:border-neutral-600 hover:shadow-md',
                      energetic:  'bg-white dark:bg-neutral-800 rounded-xl border border-[hsl(var(--tenant-secondary-200))] dark:border-[hsl(var(--tenant-secondary-800)_/_0.4)] shadow-sm hover:shadow-lg hover:-translate-y-0.5',
                      warm:       'bg-[hsl(var(--tenant-primary-500)_/_0.04)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.08)] rounded-2xl border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800)_/_0.3)] shadow-[0_2px_12px_hsl(var(--tenant-primary-500)_/_0.08)]',
                      minimalist: 'bg-white dark:bg-neutral-800/60 rounded-xl border border-slate-100 dark:border-neutral-800',
                    }[cs] || 'bg-white dark:bg-neutral-800 rounded-xl border border-slate-200/80 dark:border-neutral-700/60 shadow-sm';

                    const imgRadiusCls = {
                      classic: 'rounded-t-2xl', clinical: 'rounded-t-lg', bold: 'rounded-t-sm',
                      zen: 'rounded-t-3xl', corporate: 'rounded-t-md', energetic: 'rounded-t-xl',
                      warm: 'rounded-t-2xl', minimalist: 'rounded-t-xl',
                    }[cs] || 'rounded-t-xl';

                    const nameCls = {
                      classic:    'text-[13px] font-semibold text-slate-900 dark:text-white leading-tight',
                      clinical:   'text-[12px] font-medium text-slate-600 dark:text-neutral-300 leading-tight tracking-wide',
                      bold:       'text-[12px] font-black uppercase tracking-wide text-neutral-900 dark:text-white leading-snug',
                      zen:        'text-[13px] font-light text-slate-700 dark:text-neutral-200 leading-tight text-center tracking-wide',
                      corporate:  'text-[11px] font-semibold text-slate-900 dark:text-white leading-tight uppercase',
                      energetic:  'text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight',
                      warm:       'text-[13px] font-semibold text-slate-800 dark:text-neutral-200 leading-tight',
                      minimalist: 'text-[13px] font-normal text-slate-500 dark:text-neutral-400 leading-tight',
                    }[cs] || 'text-[13px] font-semibold text-slate-900 dark:text-white leading-tight';

                    const btnCls = {
                      classic:    'rounded-full bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]',
                      clinical:   'rounded-md border-2 border-[hsl(var(--tenant-primary-400))] dark:border-[hsl(var(--tenant-primary-600))] text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-transparent',
                      bold:       'rounded-sm bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)] font-black',
                      zen:        'rounded-full bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)]',
                      corporate:  'rounded-md bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900',
                      energetic:  'rounded-lg bg-gradient-to-r from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] text-white font-bold shadow-sm',
                      warm:       'rounded-full bg-white dark:bg-neutral-700 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-300))] border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-700))]',
                      minimalist: 'rounded-none bg-transparent text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] underline underline-offset-4 decoration-1',
                    }[cs] || 'rounded-lg bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)]';

                    const badgeCls = ({
                      bold:       'rounded-sm',
                      zen:        'rounded-full',
                      minimalist: 'rounded-full',
                      corporate:  'rounded-sm',
                    } as Record<string, string>)[cs] || 'rounded-md';

                    const fallbackGradient = ({
                      classic:    'from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-secondary-100))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
                      bold:       'from-neutral-800 to-neutral-900 dark:from-neutral-700 dark:to-neutral-800',
                      energetic:  'from-[hsl(var(--tenant-primary-400))] to-[hsl(var(--tenant-secondary-500))]',
                      warm:       'from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-primary-200))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-primary-800)_/_0.3)]',
                      corporate:  'from-slate-300 to-slate-400 dark:from-neutral-600 dark:to-neutral-700',
                    } as Record<string, string>)[cs] || 'from-slate-200 to-slate-300 dark:from-neutral-600 dark:to-neutral-700';

                    const fallbackTextCls = cs === 'bold' || cs === 'energetic'
                      ? 'text-white/80' : 'text-slate-400 dark:text-neutral-500';

                    const priceCls = cs === 'zen' ? 'text-center' : '';

                    return (
                      <Fragment key={product.id}>
                        <div
                          className={`overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-200 flex flex-col ${cardCls}`}
                          onClick={() => isGastro ? setGastroProduct(product) : setSelectedProduct(product)}
                        >
                          {/* Top accent bar — warm & energetic */}
                          {cs === 'warm' && <div className="h-[3px] bg-[hsl(var(--tenant-primary-500))]" />}
                          {cs === 'energetic' && <div className="h-[3px] bg-gradient-to-r from-[hsl(var(--tenant-primary-500))] via-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]" />}

                          {/* Image */}
                          <div className={`relative aspect-square overflow-hidden bg-slate-100 dark:bg-neutral-700 ${cs === 'warm' ? '' : imgRadiusCls}`}>
                            {primaryImage?.url ? (
                              <Image
                                src={primaryImage.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                                quality={90}
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${fallbackGradient}`}>
                                <span className={`text-3xl font-bold ${fallbackTextCls}`}>{product.name.charAt(0)}</span>
                              </div>
                            )}
                            {hasDiscount && (
                              <div className={`absolute top-1.5 left-1.5 lg:top-2.5 lg:left-2.5 px-1.5 lg:px-2 py-0.5 lg:py-1 ${badgeCls} bg-[hsl(var(--tenant-primary-500))] shadow-sm`}>
                                <span className="text-[10px] lg:text-xs font-bold text-[var(--tenant-primary-contrast)]">-{discountPct}%</span>
                              </div>
                            )}
                            {/* Energetic: price badge on image top-right */}
                            {cs === 'energetic' && showPrices && price > 0 && (
                              <div className="absolute top-1.5 right-1.5 lg:top-2.5 lg:right-2.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md bg-[hsl(var(--tenant-primary-500))] shadow-md">
                                <span className="text-[10px] lg:text-xs font-black text-[var(--tenant-primary-contrast)]">{fmtP(price)}</span>
                              </div>
                            )}
                            {/* Bold overlay gradient */}
                            {cs === 'bold' && (
                              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            )}
                          </div>

                          {/* Info — flex-col with mt-auto on bottom section to align across cards */}
                          <div className="p-2.5 lg:p-4 flex flex-col flex-1">
                            <h3 className={`line-clamp-2 lg:text-base ${nameCls}`}>
                              {product.name}
                            </h3>
                            {(() => {
                              const attrSummary = buildAttributeSummary((product as any).attributes, settings?.rubro || '');
                              if (attrSummary) return (
                                <p className="text-[10px] lg:text-xs text-slate-500 dark:text-neutral-400 mt-1 font-medium">{attrSummary}</p>
                              );
                              if (product.shortDescription) return (
                                <p className="hidden lg:block text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2">{stripHtml(product.shortDescription)}</p>
                              );
                              return null;
                            })()}

                            {/* Bottom-anchored section: price + savings + CTA always aligned */}
                            <div className={`mt-auto pt-1.5 lg:pt-3 ${priceCls}`}>
                              {showPrices && price > 0 && (
                                <div>
                                  {hasDiscount ? (
                                    <div className={`flex flex-col ${cs === 'zen' ? 'items-center' : ''}`}>
                                      <span className="text-[11px] lg:text-xs line-through text-slate-400 dark:text-neutral-500">{fmtP(comparePrice!)}</span>
                                      <span className="text-[15px] lg:text-lg font-bold text-slate-900 dark:text-white">{fmtP(price)}</span>
                                    </div>
                                  ) : (
                                    <div className={`flex flex-col ${cs === 'zen' ? 'items-center' : ''}`}>
                                      <span className="text-[11px] lg:text-xs invisible">-</span>
                                      <span className="text-[15px] lg:text-lg font-bold text-slate-900 dark:text-white">{fmtP(price)}</span>
                                    </div>
                                  )}

                                  {/* Savings callout — spacer when no discount keeps cards aligned */}
                                  {hasDiscount && cs !== 'minimalist' && cs !== 'corporate' ? (
                                    <div className={`mt-1.5 px-2 py-1 lg:py-1.5 ${badgeCls} bg-[hsl(var(--tenant-primary-500)_/_0.1)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.15)] text-center`}>
                                      <span className="text-[10px] lg:text-xs font-semibold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]">Ahorrás {fmtP(comparePrice! - price)}</span>
                                    </div>
                                  ) : cs !== 'minimalist' && cs !== 'corporate' ? (
                                    <div className="mt-1.5 px-2 py-1 invisible">
                                      <span className="text-[10px]">-</span>
                                    </div>
                                  ) : null}
                                </div>
                              )}

                              {/* CTA */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); isGastro ? setGastroProduct(product) : setSelectedProduct(product); }}
                                className={`w-full mt-2 py-2 lg:py-2.5 text-[11px] lg:text-sm font-semibold ${cs === 'bold' || cs === 'corporate' ? 'uppercase tracking-wider' : cs === 'energetic' ? 'uppercase tracking-wide' : ''} transition-colors ${btnCls}`}
                              >
                                {isGastro ? 'Agregar' : cs === 'minimalist' ? 'Ver detalle →' : cs === 'energetic' ? 'Consultar →' : cs === 'corporate' ? 'Ver más' : 'Consultar'}
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Tablet/Desktop (3 cols): sorteo after 3rd product */}
                        {_showSorteoDesktop && (
                          <div className="hidden sm:block col-span-3">
                            <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                          </div>
                        )}
                        {/* Mobile (2 cols): sorteo after 4th product */}
                        {_showSorteoMobile && (
                          <div className="sm:hidden col-span-2">
                            <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                          </div>
                        )}
                        {/* Tablet/Desktop (3 cols): ad every 6 products, limited by maxAds */}
                        {showAds && (_mobileIdx + 1) % 6 === 0 && Math.floor((_mobileIdx + 1) / 6) <= maxAds && (
                          <div className="hidden sm:block col-span-3">
                            {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                              ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                              : <AdPlaceholderBanner />}
                          </div>
                        )}
                        {/* Mobile (2 cols): ad every 4 products, limited by maxAds */}
                        {showAds && (_mobileIdx + 1) % 4 === 0 && Math.floor((_mobileIdx + 1) / 4) <= maxAds && (
                          <div className="sm:hidden col-span-2">
                            {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                              ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                              : <AdPlaceholderBanner />}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                  {/* Fallback: if not enough products for inline sorteo, show at end */}
                  {regularProducts.length <= 2 && activeSorteos.length > 0 && (
                    <div className="col-span-2 sm:col-span-3">
                      <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                    </div>
                  )}
                  {regularProducts.length === 3 && activeSorteos.length > 0 && (
                    <div className="sm:hidden col-span-2">
                      <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                    </div>
                  )}
                  {/* Ad at end if not enough products for inline placement */}
                  {showAds && regularProducts.length < 6 && (
                    <div className="hidden sm:block col-span-3">
                      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                        ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                        : <AdPlaceholderBanner />}
                    </div>
                  )}
                  {showAds && regularProducts.length < 4 && (
                    <div className="sm:hidden col-span-2">
                      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                        ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                        : <AdPlaceholderBanner />}
                    </div>
                  )}
                </div>
              )}

              {/* ── List mode: 1 col — full themed cards (mobile/tablet) ── */}
              {mobileColumns === 1 && (
                <div className="relative grid grid-cols-1 gap-4 lg:hidden">
                  {productAsServices.map((service, index) => (
                    <Fragment key={service.id}>
                      <PublicServiceCard
                        service={service as any}
                        cardStyle={(settings?.cardStyle as HeroStyleName) || (settings?.heroStyle as HeroStyleName) || 'classic'}
                        showPrices={settings?.showPrices ?? true}
                        index={index}
                        ctaLabel={isGastro ? 'Agregar' : 'Consultar'}
                        onSelect={isGastro ? ((p: any) => setGastroProduct(products.find(pr => pr.id === p.id) || null)) : handleProductSelect}
                        onShowDetail={handleShowDetail}
                      />
                      {index === 2 && activeSorteos.length > 0 && (
                        <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                      )}
                      {showAds && (index + 1) % 4 === 0 && Math.floor((index + 1) / 4) <= maxAds && (
                        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                          ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                          : <AdPlaceholderBanner />
                      )}
                    </Fragment>
                  ))}
                  {productAsServices.length < 3 && activeSorteos.length > 0 && (
                    <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                  )}
                  {showAds && productAsServices.length < 4 && (
                    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                      ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                      : <AdPlaceholderBanner />
                  )}
                </div>
              )}

              {/* Desktop for list mode (mobileColumns===1): full themed cards */}
              {mobileColumns === 1 && (
                <div className="relative hidden lg:grid lg:grid-cols-3 lg:gap-6">
                  {productAsServices.map((service, index) => (
                    <Fragment key={service.id}>
                      <PublicServiceCard
                        service={service as any}
                        cardStyle={(settings?.cardStyle as HeroStyleName) || (settings?.heroStyle as HeroStyleName) || 'classic'}
                        showPrices={settings?.showPrices ?? true}
                        index={index}
                        ctaLabel={isGastro ? 'Agregar' : 'Consultar'}
                        onSelect={isGastro ? ((p: any) => setGastroProduct(products.find(pr => pr.id === p.id) || null)) : handleProductSelect}
                        onShowDetail={handleShowDetail}
                      />
                      {index === 2 && activeSorteos.length > 0 && (
                        <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                      )}
                      {showAds && (index + 1) % 6 === 0 && Math.floor((index + 1) / 6) <= maxAds && (
                        <div className="col-span-3">
                          {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                            ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                            : <AdPlaceholderBanner />}
                        </div>
                      )}
                    </Fragment>
                  ))}
                  {productAsServices.length < 3 && activeSorteos.length > 0 && (
                    <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                  )}
                  {showAds && productAsServices.length < 6 && (
                    <div className="col-span-3">
                      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                        ? <AdSenseBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT || ''} />
                        : <AdPlaceholderBanner />}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : !isGastro && featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 dark:text-neutral-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {search ? 'No se encontraron productos' : 'Pronto agregaremos productos'}
              </p>
            </div>
          ) : null}

          {/* Gastro empty state */}
          {isGastro && featuredProducts.length === 0 && regularProducts.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 dark:text-neutral-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {search ? 'No se encontraron productos' : 'Pronto agregaremos productos'}
              </p>
            </div>
          )}

          {/* WhatsApp General CTA — only if no footer (handled below) */}

          </>}

          {/* ─── TAB: Development Projects (Inmobiliarias) ──────────── */}
          {activeTab === 'developments' && developments.length > 0 && (() => {
            const DEV_STATUS_LABEL: Record<string, string> = {
              planning: 'Planificación', pre_sale: 'Preventa',
              under_construction: 'En construcción', delivered: 'Entregado',
            };
            const DEV_STATUS_COLOR: Record<string, string> = {
              planning: 'bg-slate-500', pre_sale: 'bg-blue-500',
              under_construction: 'bg-amber-500', delivered: 'bg-emerald-500',
            };
            return (
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  Desarrollos inmobiliarios
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-neutral-400 mt-1.5 max-w-lg mx-auto">
                  Proyectos con unidades disponibles para inversión y vivienda
                </p>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {developments.map((dev) => {
                  const unitCount = dev._count?.units || dev.totalUnits || 0;
                  return (
                    <div
                      key={dev.slug}
                      onClick={() => handleOpenDevModal(dev.slug)}
                      className="group relative w-full overflow-hidden cursor-pointer rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-none dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="relative lg:w-[55%] xl:w-[50%] shrink-0">
                          {dev.coverImage ? (
                            <div className="relative h-64 sm:h-80 lg:h-full min-h-[320px]">
                              <Image src={dev.coverImage} alt={dev.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />
                            </div>
                          ) : (
                            <div className="relative h-64 sm:h-80 lg:h-full min-h-[320px] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-blue-950/30 flex items-center justify-center">
                              <div className="text-center">
                                <Building2 className="h-16 w-16 text-slate-300 dark:text-neutral-600 mx-auto" />
                                <p className="text-sm text-slate-400 dark:text-neutral-500 mt-2 font-medium">Proyecto inmobiliario</p>
                              </div>
                              <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-xl" />
                              <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-lg border border-white/20 dark:border-neutral-700/50">
                              <span className={`h-2 w-2 rounded-full ${DEV_STATUS_COLOR[dev.status] || 'bg-slate-500'} animate-pulse`} />
                              <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200">{DEV_STATUS_LABEL[dev.status] || dev.status}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 lg:hidden">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-white/20 dark:border-neutral-700/50">
                              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-neutral-700 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all" style={{ width: `${dev.progressPercent}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-neutral-200">{dev.progressPercent}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {dev.name}
                          </h3>
                          {dev.address && (
                            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-neutral-400 mt-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {dev.address}{dev.city ? `, ${dev.city}` : ''}
                            </p>
                          )}
                          {dev.description && (
                            <p className="text-sm text-slate-600 dark:text-neutral-300 mt-3 line-clamp-2 leading-relaxed">{dev.description}</p>
                          )}
                          <div className="mt-5 space-y-4">
                            <div className="hidden lg:block">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-slate-600 dark:text-neutral-400">Avance de obra</span>
                                <span className="font-bold text-slate-900 dark:text-white">{dev.progressPercent}%</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-neutral-700 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 transition-all duration-700" style={{ width: `${dev.progressPercent}%` }} />
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {unitCount > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                                  <Layers className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{unitCount} unidades</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{dev.progressPercent}% completado</span>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                                Ver ficha completa
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map — Development Projects */}
              {(() => {
                const devsWithCoords = developments.filter(d => d.latitude && d.longitude);
                if (devsWithCoords.length === 0 && !tenant.address) return null;

                // If projects have coords, show a multi-point map via Google Maps embed
                // Otherwise fallback to address search
                const firstDev = devsWithCoords[0];
                const mapQuery = firstDev
                  ? `${firstDev.latitude},${firstDev.longitude}`
                  : encodeURIComponent(`${tenant.address}, ${tenant.city || 'Argentina'}`);

                return (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Ubicación de proyectos
                    </h3>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm bg-slate-100 dark:bg-neutral-800">
                      <div className="relative w-full" style={{ paddingBottom: '45%', minHeight: '280px' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          style={{ border: 0, filter: 'saturate(0.9) contrast(1.05)' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Mapa de proyectos"
                        />
                      </div>
                      {devsWithCoords.length > 1 && (
                        <div className="px-4 py-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-t border-slate-200/50 dark:border-neutral-700/50">
                          <div className="flex flex-wrap gap-2">
                            {devsWithCoords.map(d => (
                              <a
                                key={d.slug}
                                href={`https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <MapPin className="h-3 w-3" />
                                {d.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            );
          })()}

          {/* Map — Properties (address-based) for inmobiliaria */}
          {activeTab === 'properties' && tenant.address && filteredProducts.length > 0 && (
            <div className="mt-10 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Nuestra ubicación
              </h3>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm bg-slate-100 dark:bg-neutral-800">
                <div className="relative w-full" style={{ paddingBottom: '40%', minHeight: '250px' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${tenant.address}, ${tenant.city || 'Argentina'}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    style={{ border: 0, filter: 'saturate(0.9) contrast(1.05)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de la inmobiliaria"
                  />
                </div>
                <div className="px-4 py-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-t border-slate-200/50 dark:border-neutral-700/50 flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {tenant.address}{tenant.city ? `, ${tenant.city}` : ''}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tenant.address}, ${tenant.city || 'Argentina'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Abrir en Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* YouTube Video */}
          {settings?.youtubeVideoUrl && (() => {
            const videoId = extractYoutubeId(settings.youtubeVideoUrl);
            if (!videoId) return null;
            return (
              <div className="mt-12 relative overflow-hidden">
                {/* Subtle glow behind the video */}
                <div
                  className="absolute -inset-6 rounded-[2.5rem] opacity-[0.25] dark:opacity-[0.35] blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 65%)` }}
                />
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl dark:shadow-black/30" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&color=white&autoplay=1&mute=1`}
                    title="Video del negocio"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          })()}

          {/* ─── Footer ──────────────────────────────────────────── */}
          <footer className="mt-16 border-t border-slate-200 dark:border-neutral-800">
            {/* WhatsApp CTA band */}
            {whatsappNumber && (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-neutral-400 mb-3">Tenés dudas? Escribinos</p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Quiero consultar sobre sus productos.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-green-500/25"
                >
                  <MessageCircle className="h-5 w-5" />
                  Consultanos por WhatsApp
                </a>
              </div>
            )}

            {/* Info grid */}
            <div className="py-8 border-t border-slate-100 dark:border-neutral-800/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Contact */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-3">Contacto</h4>
                  <div className="space-y-2">
                    {tenant.phone && (
                      <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Phone className="h-4 w-4 text-slate-400 dark:text-neutral-500" />{tenant.phone}
                      </a>
                    )}
                    {(tenant as any).email && (
                      <a href={`mailto:${(tenant as any).email}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Mail className="h-4 w-4 text-slate-400 dark:text-neutral-500" />{(tenant as any).email}
                      </a>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {tenant.instagram && (
                        <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors"><Instagram className="h-5 w-5" /></a>
                      )}
                      {tenant.facebook && (
                        <a href={`https://facebook.com/${tenant.facebook}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors"><Facebook className="h-5 w-5" /></a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Hours */}
                {(tenant.address || settings?.businessHours) && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-3">Ubicacion</h4>
                    <div className="space-y-2">
                      {tenant.address && (
                        <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
                          <MapPin className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                          <span>{tenant.address}{tenant.city ? `, ${tenant.city}` : ''}</span>
                        </p>
                      )}
                      {settings?.businessHours && (
                        <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
                          <Clock className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                          <span>{settings.businessHours}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping & Payment */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-3">Informacion</h4>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-neutral-300">
                    {shippingConfig?.delivery?.enabled && (
                      <p className="flex items-start gap-2">
                        <Truck className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                        <span>{shippingConfig.delivery.info || 'Envios disponibles'}</span>
                      </p>
                    )}
                    {shippingConfig?.pickup?.enabled && (
                      <p className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                        <span>Retiro en local{shippingConfig.pickup.address ? `: ${shippingConfig.pickup.address}` : ''}</span>
                      </p>
                    )}
                    {hasMercadoPago && (
                      <p className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                        <span>Mercado Pago · Tarjetas · Transferencia</span>
                      </p>
                    )}
                    {!shippingConfig?.delivery?.enabled && !shippingConfig?.pickup?.enabled && !hasMercadoPago && (
                      <p className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                        <span>Consultas por WhatsApp</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TurnoLink badge */}
            <div className="py-4 border-t border-slate-100 dark:border-neutral-800/50 text-center">
              <p className="text-xs text-slate-400 dark:text-neutral-600">
                Tienda creada con{' '}
                <a href="https://turnolink.com.ar/register" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                  TurnoLink
                </a>
                {' '}·{' '}
                <a href="https://turnolink.com.ar/register" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors underline underline-offset-2">
                  Crea tu tienda gratis
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          slug={slug}
          cardStyle={(settings?.cardStyle as HeroStyleName) || (settings?.heroStyle as HeroStyleName) || 'classic'}
          whatsappNumber={whatsappNumber}
          hasMercadoPago={hasMercadoPago}
          showPrices={settings?.showPrices ?? true}
          category={categories.find(c => c.id === selectedProduct.categoryId) || null}
          shippingConfig={shippingConfig}
          tenantName={tenant.name}
          isFeatured={selectedProduct.isFeatured}
          tenantCurrency={tenantCurrency}
          onClose={() => setSelectedProduct(null)}
          onWhatsApp={() => window.open(getWhatsAppLink(selectedProduct), '_blank')}
        />
      )}

      {/* ── Gastro: Product Add Modal ── */}
      {isGastro && gastroProduct && (
        <ProductAddModal
          product={{
            id: gastroProduct.id,
            name: gastroProduct.name,
            description: gastroProduct.description || undefined,
            shortDescription: gastroProduct.shortDescription || undefined,
            price: Number(gastroProduct.price),
            images: gastroProduct.images.map(img => ({ url: img.url, alt: img.alt ?? undefined })),
            attributes: (gastroProduct as any).attributes,
          }}
          options={extractGastroOptions(gastroProduct)}
          formatPrice={formatPrice}
          onAdd={(item) => addGastroItem(item, slug)}
          onClose={() => setGastroProduct(null)}
        />
      )}

      {/* ── Gastro: Back to Tracking ── */}
      {isGastro && activeOrderNumber && activeOrderSlug === slug && (
        <div className={`fixed left-0 right-0 z-40 px-4 max-w-lg mx-auto ${gastroCartCount > 0 ? 'bottom-[5.5rem]' : 'bottom-4'}`}>
          <Link
            href={`/${slug}/pedido/${encodeURIComponent(activeOrderNumber)}`}
            className="group flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98] hover:shadow-[0_6px_28px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}12` }}>
                <ClipboardList className="h-5 w-5" style={{ color: primaryColor }} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900" style={{ backgroundColor: primaryColor }}>
                  <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ backgroundColor: primaryColor }} />
                </span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">Tu pedido está en curso</p>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium">{activeOrderNumber}</p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 text-[13px] font-bold text-white px-4 py-2 rounded-xl transition-all group-hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Ver
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      )}

      {/* ── Gastro: Floating Cart ── */}
      {isGastro && (
        <GastroCartFloating
          slug={slug}
          formatPrice={formatPrice}
          onCheckout={() => setShowGastroCheckout(true)}
        />
      )}

      {/* ── Gastro: Checkout ── */}
      {isGastro && showGastroCheckout && (
        <GastroCheckout
          slug={slug}
          tenantName={tenant.name}
          whatsappNumber={whatsappNumber}
          hasMercadoPago={hasMercadoPago}
          formatPrice={formatPrice}
          onClose={() => setShowGastroCheckout(false)}
          onComplete={(orderNum) => {
            useGastroCartStore.getState().setActiveOrder(slug, orderNum);
            window.location.href = `/${slug}/pedido/${encodeURIComponent(orderNum)}`;
          }}
        />
      )}

      {isGastro && showTableReservation && (
        <TableReservation
          slug={slug}
          services={tenant.services || []}
          primaryColor={primaryColor}
          whatsappNumber={whatsappNumber}
          onClose={() => setShowTableReservation(false)}
        />
      )}
      {/* ─── Development Project Modal ──────────────────────── */}
      {devModalOpen && (() => {
        const UNIT_TYPE_LABELS: Record<string, string> = {
          monoambiente: 'Monoambiente', '1amb': '1 Ambiente', '2amb': '2 Ambientes', '3amb': '3 Ambientes',
          local: 'Local comercial', cochera: 'Cochera', baulera: 'Baulera',
        };
        const UNIT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
          available: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
          reserved: { label: 'Reservada', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
          sold: { label: 'Vendida', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
          escriturada: { label: 'Escriturada', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
        };
        const DEV_STATUS_LABEL: Record<string, string> = {
          planning: 'Planificación', pre_sale: 'Preventa',
          under_construction: 'En construcción', delivered: 'Entregado',
        };
        const DEV_STATUS_COLOR: Record<string, string> = {
          planning: 'bg-slate-500', pre_sale: 'bg-blue-500',
          under_construction: 'bg-amber-500', delivered: 'bg-emerald-500',
        };
        const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
        const d = devDetail;
        const allImages = d ? [d.coverImage, ...(d.images || [])].filter(Boolean) : [];
        const availableUnits = d?.units?.filter((u: any) => u.status === 'available') || [];
        const reservedUnits = d?.units?.filter((u: any) => u.status === 'reserved') || [];
        const soldUnits = d?.units?.filter((u: any) => u.status === 'sold') || [];
        const escrituradaUnits = d?.units?.filter((u: any) => u.status === 'escriturada') || [];
        const amenities = d?.amenities ? (Array.isArray(d.amenities) ? d.amenities : (() => { try { return JSON.parse(d.amenities); } catch { return []; } })()) : [];
        const ADJUSTMENT_LABELS: Record<string, string> = { fixed_usd: 'USD Fijo', fixed_ars: 'ARS Fijo', cac: 'CAC', uva: 'UVA', dolar_linked: 'Dólar Linked' };
        const minPrice = d?.units?.length > 0 ? Math.min(...d.units.filter((u: any) => u.price > 0).map((u: any) => u.price)) : 0;
        const maxPrice = d?.units?.length > 0 ? Math.max(...d.units.filter((u: any) => u.price > 0).map((u: any) => u.price)) : 0;

        const fundingPct = d && d.targetFundingAmount > 0 ? Math.min(((d.currentFundedAmount || 0) / d.targetFundingAmount) * 100, 100) : 0;

        return (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={closeDevModal} />

            {/* Modal shell */}
            <div className="relative w-full max-w-5xl mx-2 sm:mx-4 my-4 sm:my-6 rounded-2xl sm:rounded-[20px] bg-white dark:bg-neutral-900 shadow-[0_32px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-200">

              {/* Close */}
              <button onClick={closeDevModal} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 hover:text-white transition-all shadow-lg">
                <X className="h-5 w-5" />
              </button>

              {devLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Building2 className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-neutral-500 mt-5 font-medium">Cargando proyecto...</p>
                </div>
              ) : d ? (
                <>
                  {/* ═══════════ HERO IMAGE ═══════════ */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] overflow-hidden rounded-t-2xl sm:rounded-t-[20px]">
                    {allImages.length > 0 ? (
                      <>
                        {/* Preload all gallery images stacked — instant switching */}
                        {allImages.map((imgSrc: string, imgIdx: number) => (
                          <Image key={imgSrc} src={imgSrc} alt={`${d.name} ${imgIdx + 1}`} fill className={`object-cover transition-opacity duration-300 pointer-events-none ${imgIdx === devGalleryIdx ? 'opacity-100' : 'opacity-0'}`} sizes="(max-width: 768px) 100vw, 1120px" priority={imgIdx <= 1} loading={imgIdx <= 2 ? 'eager' : 'lazy'} />
                        ))}
                        {/* Subtle vignette for contrast on nav elements */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent pointer-events-none" />
                        {allImages.length > 1 && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(i => i > 0 ? i - 1 : allImages.length - 1); }} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all shadow-xl">
                              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(i => i < allImages.length - 1 ? i + 1 : 0); }} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all shadow-xl">
                              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                            {/* Counter pill */}
                            <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium tabular-nums">
                              {devGalleryIdx + 1} / {allImages.length}
                            </div>
                            {/* Dot nav */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                              {allImages.map((_: any, i: number) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(i); }} className={`h-1.5 rounded-full transition-all duration-300 ${i === devGalleryIdx ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/50 dark:from-neutral-800 dark:via-neutral-850 dark:to-blue-950/20">
                        <Building2 className="h-24 w-24 text-slate-200 dark:text-neutral-700" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-xl border border-white/30 dark:border-neutral-700/50">
                        <span className={`h-2.5 w-2.5 rounded-full ${DEV_STATUS_COLOR[d.status] || 'bg-slate-500'} shadow-sm shadow-current/30`} style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                        <span className="text-sm font-bold text-slate-800 dark:text-neutral-100 tracking-tight">{DEV_STATUS_LABEL[d.status] || d.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* ═══════════ BODY ═══════════ */}
                  <div className="px-5 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-8 sm:space-y-10">

                    {/* ── Header: title, location, key stats ── */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{d.name}</h2>
                        {d.address && (
                          <p className="flex items-center gap-2 text-sm sm:text-base text-slate-500 dark:text-neutral-400 mt-2.5">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                            {d.address}{d.city ? `, ${d.city}` : ''}
                          </p>
                        )}
                      </div>
                      {minPrice > 0 && (
                        <div className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg shadow-blue-500/20">
                          <p className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">{minPrice === maxPrice ? 'Precio' : 'Desde'}</p>
                          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{fmtUSD(minPrice)}</p>
                        </div>
                      )}
                    </div>

                    {/* ── Metric cards ── */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/50 overflow-hidden">
                        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-xl" />
                        <Layers className="h-5 w-5 text-blue-500 dark:text-blue-400 mb-2" />
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{d.totalUnits}</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium mt-0.5">Unidades totales</p>
                      </div>
                      <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/50 overflow-hidden">
                        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl" />
                        <TrendingUp className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mb-2" />
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{d.progressPercent}<span className="text-base font-bold text-slate-400 dark:text-neutral-500">%</span></p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium mt-0.5">Avance de obra</p>
                      </div>
                      <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/50 overflow-hidden">
                        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-xl" />
                        <CheckCircle2 className="h-5 w-5 text-violet-500 dark:text-violet-400 mb-2" />
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{availableUnits.length}</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium mt-0.5">Disponibles</p>
                      </div>
                    </div>

                    {/* ── Description ── */}
                    {d.description && (
                      <div className="relative">
                        <div className="absolute -left-3 sm:-left-5 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400" />
                        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed pl-4 sm:pl-3">{d.description}</p>
                      </div>
                    )}

                    {/* ── Amenities ── */}
                    {amenities.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {amenities.map((a: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800/40">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Delivery date ── */}
                    {d.deliveryDate && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-800/30">
                        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40"><Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Fecha estimada de entrega</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">{new Date(d.deliveryDate).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    )}

                    {/* ── Progress ── */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/80 dark:to-neutral-800/40 border border-slate-100 dark:border-neutral-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">Progreso general</span>
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{d.progressPercent}%</span>
                      </div>
                      <div className="h-3.5 rounded-full bg-slate-200/80 dark:bg-neutral-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 transition-all duration-1000 ease-out relative" style={{ width: `${d.progressPercent}%` }}>
                          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_33%,rgba(255,255,255,0.3)_50%,transparent_67%)] animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>

                    {/* ── Payment Plans ── */}
                    {d.paymentPlans?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-4">Planes de financiación</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {d.paymentPlans.map((plan: any) => (
                            <div key={plan.id} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100/80 dark:border-blue-800/30 hover:shadow-md transition-all">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</p>
                              {plan.description && <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{plan.description}</p>}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/60 text-xs font-bold text-slate-700 dark:text-neutral-300 border border-slate-200/60 dark:border-neutral-700/40">{plan.downPaymentPercent}% anticipo</span>
                                <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/60 text-xs font-bold text-slate-700 dark:text-neutral-300 border border-slate-200/60 dark:border-neutral-700/40">{plan.installments} cuotas</span>
                                {plan.discountPercent > 0 && <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/30">-{plan.discountPercent}% dto.</span>}
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-neutral-700/40 text-xs font-medium text-slate-500 dark:text-neutral-400">{ADJUSTMENT_LABELS[plan.adjustmentType] || plan.adjustmentType}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Video ── */}
                    {d.videoUrl && (() => {
                      const ytMatch = d.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
                      const vimeoMatch = d.videoUrl.match(/vimeo\.com\/(\d+)/);
                      const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
                      return embedUrl ? (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-4">Video del proyecto</h3>
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-700">
                            <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* ── Brochure ── */}
                    {d.brochureUrl && (
                      <a href={d.brochureUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/50 hover:bg-slate-100/80 dark:hover:bg-neutral-700/40 transition-all group">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors"><FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Descargar Brochure</p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">PDF con información completa del proyecto</p>
                        </div>
                        <Download className="h-5 w-5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 transition-colors" />
                      </a>
                    )}

                    {/* ── Milestones ── */}
                    {d.milestones?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-5">Avance de obra</h3>
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-neutral-700" />
                          <div className="space-y-1">
                            {d.milestones.map((m: any, i: number) => (
                              <div key={i} className="relative flex items-start gap-4 pl-1 py-3">
                                {/* Timeline dot */}
                                <div className={`relative z-10 flex items-center justify-center h-[38px] w-[38px] rounded-xl shrink-0 ${m.progressPercent >= 100 ? 'bg-emerald-500 shadow-md shadow-emerald-500/25' : m.progressPercent > 0 ? 'bg-blue-500 shadow-md shadow-blue-500/25' : 'bg-slate-200 dark:bg-neutral-700'}`}>
                                  {m.progressPercent >= 100
                                    ? <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                                    : m.progressPercent > 0
                                      ? <TrendingUp className="h-4 w-4 text-white" />
                                      : <Clock className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                                    <span className={`text-sm font-extrabold tabular-nums shrink-0 ${m.progressPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : m.progressPercent > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-500'}`}>
                                      {m.progressPercent}%
                                    </span>
                                  </div>
                                  {m.description && <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{m.description}</p>}
                                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-neutral-700/80 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${m.progressPercent >= 100 ? 'bg-emerald-500' : m.progressPercent > 0 ? 'bg-blue-500' : ''}`}
                                      style={{ width: `${m.progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Units ── */}
                    {d.units?.length > 0 && (
                      <div>
                        {/* Section header with legend */}
                        <div className="flex items-end justify-between mb-6">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 tracking-tight">Unidades del proyecto</h3>
                            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">{d.units.length} unidades · {availableUnits.length} disponibles</p>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-medium">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Disp. ({availableUnits.length})</span>
                            {reservedUnits.length > 0 && <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Res. ({reservedUnits.length})</span>}
                            {soldUnits.length > 0 && <span className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-neutral-500" />Vend. ({soldUnits.length})</span>}
                            {escrituradaUnits.length > 0 && <span className="flex items-center gap-1.5 text-purple-500 dark:text-purple-400"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" />Escr. ({escrituradaUnits.length})</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {d.units.map((unit: any) => {
                            const us = UNIT_STATUS_MAP[unit.status] || UNIT_STATUS_MAP.available;
                            const isAvailable = unit.status === 'available';
                            const isReserved = unit.status === 'reserved';
                            const isSold = unit.status === 'sold' || unit.status === 'escriturada';
                            const pricePerM2 = unit.price > 0 && unit.area > 0 ? Math.round(unit.price / unit.area) : null;
                            const accentColor = isAvailable ? 'emerald' : isReserved ? 'amber' : unit.status === 'escriturada' ? 'purple' : 'slate';

                            return (
                              <div key={unit.id} className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                                isAvailable
                                  ? 'bg-white dark:bg-neutral-800 border-slate-200/80 dark:border-neutral-700/60 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5'
                                  : isReserved
                                    ? 'bg-white dark:bg-neutral-800 border-amber-200/60 dark:border-amber-800/30'
                                    : 'bg-slate-50/50 dark:bg-neutral-800/40 border-slate-200/40 dark:border-neutral-700/20'
                              }`}>

                                {/* Top bar: accent color */}
                                <div className={`h-1 w-full bg-gradient-to-r ${
                                  isAvailable ? 'from-emerald-400 to-teal-500' : isReserved ? 'from-amber-400 to-orange-500' : unit.status === 'escriturada' ? 'from-purple-400 to-purple-500' : 'from-slate-300 to-slate-400 dark:from-neutral-600 dark:to-neutral-500'
                                }`} />

                                <div className={`p-5 ${isSold ? 'opacity-50' : ''}`}>
                                  {/* Row 1: ID + Type + Price */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{unit.unitIdentifier}</h4>
                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${us.cls}`}>{us.label}</span>
                                      </div>
                                      <p className="text-[13px] text-slate-500 dark:text-neutral-400 font-medium mt-1">{UNIT_TYPE_LABELS[unit.unitType] || unit.unitType}</p>
                                    </div>
                                    {unit.price > 0 && (
                                      <div className="text-right shrink-0">
                                        <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">{fmtUSD(unit.price)}</p>
                                        {pricePerM2 && (
                                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{fmtUSD(pricePerM2)}/m²</p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Row 2: Specs grid */}
                                  <div className="grid grid-cols-4 gap-px mt-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-700/40 border border-slate-100 dark:border-neutral-700/30">
                                    {[
                                      { label: 'Piso', value: unit.floor && unit.floor !== '-' && unit.floor !== 'SS' && unit.floor !== 'PB' ? unit.floor + '°' : unit.floor || '-' },
                                      { label: 'Sup. total', value: unit.area > 0 ? `${unit.area} m²` : '-' },
                                      { label: 'Sup. cub.', value: unit.supCubierta > 0 ? `${unit.supCubierta} m²` : '-' },
                                      { label: 'Orient.', value: unit.orientation && unit.orientation !== '-' ? unit.orientation : '-' },
                                    ].map((spec, i) => (
                                      <div key={i} className="bg-white dark:bg-neutral-800/80 py-2.5 px-2 text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-neutral-500 font-semibold leading-none">{spec.label}</p>
                                        <p className="text-[13px] font-bold text-slate-700 dark:text-neutral-200 mt-1 leading-none tabular-nums">{spec.value}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Reservation info */}
                                  {isReserved && unit.reservationExpiresAt && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 border border-amber-200/40 dark:border-amber-800/20">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      {(() => {
                                        const mins = Math.max(0, Math.floor((new Date(unit.reservationExpiresAt).getTime() - Date.now()) / 60000));
                                        return mins > 0 ? `Reserva vigente — ${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h restantes` : 'Reserva vencida';
                                      })()}
                                    </div>
                                  )}

                                  {/* Floor plan link */}
                                  {unit.floorPlanUrl && (
                                    <a href={unit.floorPlanUrl} target="_blank" rel="noopener noreferrer"
                                      className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 py-2 rounded-xl border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/15 hover:bg-blue-100/60 dark:hover:bg-blue-900/25 transition-colors">
                                      <FileText className="h-3.5 w-3.5" /> Ver plano de unidad
                                    </a>
                                  )}

                                  {/* CTA */}
                                  {isAvailable && whatsappNumber && (
                                    <a
                                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa la unidad ${unit.unitIdentifier} (${UNIT_TYPE_LABELS[unit.unitType] || unit.unitType}${unit.area ? `, ${unit.area}m²` : ''}) del proyecto "${d.name}"${unit.price ? ` — ${fmtUSD(unit.price)}` : ''}. Quisiera más información.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      Consultar por esta unidad
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Funding ── */}
                    {d.targetFundingAmount > 0 && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/10 border border-emerald-100/80 dark:border-emerald-900/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Financiamiento</span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">{fmtUSD(d.currentFundedAmount || 0)} <span className="text-slate-400 dark:text-neutral-500 font-medium">/ {fmtUSD(d.targetFundingAmount)}</span></span>
                        </div>
                        <div className="h-3 rounded-full bg-white/60 dark:bg-neutral-700/60 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${fundingPct}%` }} />
                        </div>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 font-semibold mt-2">{fundingPct.toFixed(0)}% financiado</p>
                      </div>
                    )}
                  </div>

                  {/* ═══════════ STICKY CTA FOOTER ═══════════ */}
                  {whatsappNumber && (
                    <div className="sticky bottom-0 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-neutral-700/40 rounded-b-2xl sm:rounded-b-[20px]">
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <div className="hidden sm:block flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{d.name}</p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">{availableUnits.length} unidades disponibles {minPrice > 0 ? `· Desde ${fmtUSD(minPrice)}` : ''}</p>
                        </div>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa el proyecto "${d.name}" (${d.address || ''}). Quisiera recibir más información.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base transition-all shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Quiero más información
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        );
      })()}
    </PublicThemeWrapper>
  );
}

/** Extract selectable options from a gastro product's description */
function extractGastroOptions(product: Product): { label: string; choices: string[]; required?: boolean }[] {
  const options: { label: string; choices: string[]; required?: boolean }[] = [];
  const desc = product.description || '';

  // Parse common gastro patterns from descriptions
  const patterns = [
    { regex: /gu(?:a|á)rnici(?:o|ó)n[^:]*:\s*([^.]+)/i, label: 'Guarnición', required: true },
    { regex: /salsa[s]?[^:]*:\s*([^.]+)/i, label: 'Salsa' },
    { regex: /cocci(?:o|ó)n[^:]*:\s*([^.]+)/i, label: 'Cocción', required: true },
    { regex: /t(?:e|é)rmino[^:]*:\s*([^.]+)/i, label: 'Término', required: true },
    { regex: /aderezo[s]?[^:]*:\s*([^.]+)/i, label: 'Aderezo' },
    { regex: /punto[^:]*:\s*([^.]+)/i, label: 'Punto' },
  ];

  for (const { regex, label, required } of patterns) {
    const match = desc.match(regex);
    if (match) {
      const choices = match[1]
        .split(/,|\/|\so\s/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50);
      if (choices.length >= 2) {
        options.push({ label, choices, required });
      }
    }
  }

  return options;
}

// =============================================================================
// Fullscreen Zoom Viewer — Pinch-to-zoom + double-tap to close
// =============================================================================

function FullscreenZoomViewer({
  images,
  currentIndex,
  productName,
  onClose,
  onChangeIndex,
}: {
  images: string[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Pinch state
  const pinchRef = useRef<{
    initialDistance: number;
    initialScale: number;
    midX: number;
    midY: number;
  } | null>(null);

  // Pan state
  const panRef = useRef<{
    startX: number;
    startY: number;
    initialTx: number;
    initialTy: number;
  } | null>(null);

  // Double-tap detection
  const lastTapRef = useRef<number>(0);

  // Swipe state (for image navigation when not zoomed)
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);

  const hasMultiple = images.length > 1;

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [currentIndex]);

  // Clamp translate so image doesn't drift off-screen
  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return { x: tx, y: ty };
    const cRect = container.getBoundingClientRect();
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // Displayed size
    const ratio = Math.min(cRect.width / iw, cRect.height / ih);
    const dw = iw * ratio * s;
    const dh = ih * ratio * s;
    const maxTx = Math.max(0, (dw - cRect.width) / 2);
    const maxTy = Math.max(0, (dh - cRect.height) / 2);
    return {
      x: Math.max(-maxTx, Math.min(maxTx, tx)),
      y: Math.max(-maxTy, Math.min(maxTy, ty)),
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pinchRef.current = {
        initialDistance: dist,
        initialScale: scale,
        midX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        midY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      panRef.current = null;
      swipeRef.current = null;
    } else if (e.touches.length === 1) {
      // Double-tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap → close
        e.preventDefault();
        onClose();
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        // Pan start (only when zoomed)
        panRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          initialTx: translate.x,
          initialTy: translate.y,
        };
        swipeRef.current = null;
      } else {
        // Swipe start (for image navigation when not zoomed)
        swipeRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
        };
        panRef.current = null;
      }
    }
  }, [scale, translate, onClose]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(1, Math.min(5, pinchRef.current.initialScale * (dist / pinchRef.current.initialDistance)));
      setScale(newScale);
      if (newScale <= 1) {
        setTranslate({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && panRef.current && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      const clamped = clampTranslate(panRef.current.initialTx + dx, panRef.current.initialTy + dy, scale);
      setTranslate(clamped);
    }
  }, [scale, clampTranslate]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Pinch end — snap to 1 if close
    if (pinchRef.current) {
      pinchRef.current = null;
      if (scale < 1.15) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    }

    // Pan end
    if (panRef.current) {
      panRef.current = null;
    }

    // Swipe end (navigate images)
    if (swipeRef.current && e.changedTouches.length === 1 && hasMultiple) {
      const dx = e.changedTouches[0].clientX - swipeRef.current.startX;
      const dy = e.changedTouches[0].clientY - swipeRef.current.startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) {
          onChangeIndex(currentIndex + 1 >= images.length ? 0 : currentIndex + 1);
        } else {
          onChangeIndex(currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1);
        }
      }
      swipeRef.current = null;
    }
  }, [scale, hasMultiple, currentIndex, images.length, onChangeIndex]);

  // Desktop: scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newScale = Math.max(1, Math.min(5, scale + delta));
    setScale(newScale);
    if (newScale <= 1) {
      setTranslate({ x: 0, y: 0 });
    } else {
      setTranslate(prev => clampTranslate(prev.x, prev.y, newScale));
    }
  }, [scale, clampTranslate]);

  // Desktop: double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 z-10">
        <span className="text-white/70 text-sm font-medium">
          {currentIndex + 1} / {images.length}
          {scale > 1 && <span className="ml-2 text-white/40 text-xs">{Math.round(scale * 100)}%</span>}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Image area with pinch-to-zoom */}
      <div
        ref={containerRef}
        className="flex-1 overflow-clip relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={images[currentIndex]}
            alt={`${productName} ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain will-change-transform select-none"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: pinchRef.current || panRef.current ? 'none' : 'transform 0.2s ease-out',
              cursor: scale > 1 ? 'grab' : 'zoom-in',
            }}
            draggable={false}
          />
        </div>

        {/* Navigation arrows (desktop, visible on hover) */}
        {hasMultiple && scale <= 1 && (
          <>
            <button
              onClick={() => onChangeIndex(currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => onChangeIndex(currentIndex + 1 >= images.length ? 0 : currentIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors hidden md:flex"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Zoom hint — only on first open, fades out */}
        {scale <= 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs font-medium pointer-events-none md:hidden animate-pulse">
            Pellizcá para hacer zoom · Doble tap para cerrar
          </div>
        )}
      </div>

      {/* Bottom thumbnails */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-3 px-4 py-3 shrink-0">
          <button
            onClick={() => onChangeIndex(currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors md:hidden"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex gap-2 overflow-x-auto max-w-[60vw]">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => onChangeIndex(i)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === currentIndex ? 'border-white shadow-lg' : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
          <button
            onClick={() => onChangeIndex(currentIndex + 1 >= images.length ? 0 : currentIndex + 1)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors md:hidden"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Product Detail Modal — Multi-step purchase flow for catalog mode
// Steps: detail → form (customer data + shipping) → processing → confirmation
// =============================================================================

type PurchaseStep = 'detail' | 'form' | 'processing' | 'confirmed';

function ProductDetailModal({
  product,
  slug,
  cardStyle,
  whatsappNumber,
  hasMercadoPago,
  showPrices,
  category,
  shippingConfig,
  tenantName,
  tenantCurrency = 'ARS',
  onClose,
  onWhatsApp,
  isFeatured = false,
}: {
  product: Product;
  slug: string;
  cardStyle: HeroStyleName;
  whatsappNumber: string;
  hasMercadoPago: boolean;
  showPrices: boolean;
  category: ProductCategory | null;
  shippingConfig: ShippingConfig | null;
  tenantName: string;
  tenantCurrency?: string;
  onClose: () => void;
  onWhatsApp: () => void;
  isFeatured?: boolean;
}) {
  const formatPrice = (price: number, currency?: string) => _formatPrice(price, currency || (product as any).currency || tenantCurrency);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize HTML entities + tags → clean text (reused in ficha técnica + descriptions)
  const cleanHtml = useCallback((s: string) => s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:div|p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim(), []);

  // Swipe-down-to-dismiss
  const modalRef = useRef<HTMLDivElement>(null);
  const swipeStartY = useRef(0);
  const [swipeDragY, setSwipeDragY] = useState(0);
  const [swipeAnimating, setSwipeAnimating] = useState(false);
  const swipeDragging = useRef(false);
  const lastDragY = useRef(0);

  const swipeBlocked = useRef(false);
  const closing = useRef(false);
  const [entryDone, setEntryDone] = useState(false);

  // Remove entry animation class after it finishes so inline transform works
  useEffect(() => {
    const t = setTimeout(() => setEntryDone(true), 650);
    return () => clearTimeout(t);
  }, []);

  // Animated close — slides modal down + fades backdrop, then unmounts
  const animatedClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setSwipeAnimating(true);
    setSwipeDragY(700);
    setTimeout(() => {
      onClose();
      closing.current = false;
    }, 280);
  }, [onClose]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    // Find the scrollable content area inside the modal
    const getScrollTop = () => {
      const scrollable = el.querySelector('[class*="overflow-y-auto"]');
      return scrollable ? scrollable.scrollTop : 0;
    };

    const onStart = (e: TouchEvent) => {
      swipeStartY.current = e.touches[0].clientY;
      swipeDragging.current = false;
      setSwipeAnimating(false);
      // Block swipe-dismiss if modal content is scrolled down
      swipeBlocked.current = getScrollTop() > 5;
    };
    const onMove = (e: TouchEvent) => {
      if (swipeBlocked.current) return;
      const dy = e.touches[0].clientY - swipeStartY.current;
      if (dy > 12) {
        swipeDragging.current = true;
        e.preventDefault();
        const val = Math.min(dy * 0.55, 300);
        lastDragY.current = val;
        setSwipeDragY(val);
      } else if (dy < -5 && swipeDragging.current) {
        swipeDragging.current = false;
        lastDragY.current = 0;
        setSwipeDragY(0);
      }
    };
    const onEnd = () => {
      if (swipeDragging.current && lastDragY.current > 60) {
        animatedClose();
      } else if (swipeDragging.current) {
        setSwipeAnimating(true);
        setSwipeDragY(0);
        setTimeout(() => setSwipeAnimating(false), 250);
      }
      swipeDragging.current = false;
      swipeBlocked.current = false;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, [animatedClose]);

  // Purchase flow state
  const [step, setStep] = useState<PurchaseStep>('detail');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [shippingMethod, setShippingMethod] = useState<'retiro' | 'envio' | 'punto_encuentro' | ''>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; initPoint?: string } | null>(null);

  const [shareCopied, setShareCopied] = useState(false);

  const styleConfig = HERO_STYLES[cardStyle] || HERO_STYLES.classic;

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}/producto/${product.slug}`
    : `/${slug}/producto/${product.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.shortDescription || product.name, url: productUrl });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    try {
      await navigator.clipboard.writeText(productUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* fallback: do nothing */ }
  };

  const handleShareWhatsApp = () => {
    const text = `${product.name}${showPrices ? ` — ${formatPrice(price)}` : ''}\n${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Build image array — primary first, then rest
  const allImages: string[] = [];
  if (product.images && product.images.length > 0) {
    const primary = product.images.find(i => i.isPrimary);
    if (primary) allImages.push(primary.url);
    for (const img of product.images) {
      if (!allImages.includes(img.url)) allImages.push(img.url);
    }
  }

  const hasMultipleImages = allImages.length > 1;
  const price = Number(product.price);
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice! - price) / comparePrice!) * 100) : 0;
  const activeVariants = product.variants?.filter(v => v.isActive) || [];
  const outOfStock = product.trackInventory && product.stock <= 0;

  // Effective price (variant override or product price)
  const selectedVariantObj = activeVariants.find(v => v.id === selectedVariant);
  const effectivePrice = selectedVariantObj?.price != null ? Number(selectedVariantObj.price) : price;
  const totalPrice = effectivePrice * quantity;

  // Shipping options available
  const hasPickup = shippingConfig?.pickup?.enabled;
  const hasDelivery = shippingConfig?.delivery?.enabled;
  const hasMeetingPoint = shippingConfig?.meetingPoint?.enabled;
  const hasAnyShipping = hasPickup || hasDelivery || hasMeetingPoint;

  // Auto-select shipping if only one option
  useEffect(() => {
    const enabledMethods: ('retiro' | 'envio' | 'punto_encuentro')[] = [];
    if (hasPickup) enabledMethods.push('retiro');
    if (hasDelivery) enabledMethods.push('envio');
    if (hasMeetingPoint) enabledMethods.push('punto_encuentro');
    if (enabledMethods.length === 1 && !shippingMethod) {
      setShippingMethod(enabledMethods[0]);
    }
  }, [hasPickup, hasDelivery, hasMeetingPoint, shippingMethod]);

  // Style-aware badge classes
  const priceBadgeCls = 'bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)]' + (cardStyle === 'bold' ? ' font-black' : '');

  const goTo = (index: number) => {
    if (index < 0) setCurrentImageIndex(allImages.length - 1);
    else if (index >= allImages.length) setCurrentImageIndex(0);
    else setCurrentImageIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasMultipleImages) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(dx < 0 ? currentImageIndex + 1 : currentImageIndex - 1);
    }
    touchStartRef.current = null;
  };

  // Scroll content to top when step changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Validate & Submit ──────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!customerForm.name.trim() || customerForm.name.trim().length < 2) errors.name = 'Ingresá tu nombre';
    if (!customerForm.phone.trim() || !/^[+]?[\d\s-]{8,20}$/.test(customerForm.phone.trim())) errors.phone = 'Ingresá un teléfono válido';
    if (customerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) errors.email = 'Email inválido';
    if (hasAnyShipping && !shippingMethod) errors.shipping = 'Seleccioná cómo recibir tu compra';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customerForm, shippingMethod, hasAnyShipping]);

  const handleSubmitOrder = useCallback(async () => {
    if (!validateForm()) return;
    setStep('processing');
    setSubmitError(null);
    try {
      const result = await publicApi.createOrder(slug, {
        items: [{ productId: product.id, variantId: selectedVariant || undefined, quantity }],
        customer: {
          name: customerForm.name.trim(),
          email: customerForm.email.trim() || `${Date.now()}@noemail.turnolink.com.ar`,
          phone: customerForm.phone.trim(),
        },
        shipping: { method: shippingMethod || 'retiro' },
        paymentMethod: hasMercadoPago ? 'mercadopago' : 'efectivo',
        notes: customerForm.notes.trim() || undefined,
      });

      if (hasMercadoPago && result.initPoint) {
        // Redirect to MercadoPago
        setOrderResult({ orderNumber: result.order.orderNumber, initPoint: result.initPoint });
        window.location.href = result.initPoint;
      } else {
        // No MP or no initPoint — show confirmation
        setOrderResult({ orderNumber: result.order.orderNumber });
        setStep('confirmed');
      }
    } catch (error: any) {
      setSubmitError(error?.message || 'Error al procesar tu compra. Por favor intentá de nuevo.');
      setStep('form');
    }
  }, [validateForm, slug, product.id, selectedVariant, quantity, customerForm, shippingMethod, hasMercadoPago]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={animatedClose}
    >
      {/* Backdrop — stays fixed, fades as modal drags down */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${entryDone ? '' : 'animate-fade-in'}`}
        style={swipeDragY > 0 ? { opacity: Math.max(1 - swipeDragY / 300, 0), transition: swipeAnimating ? 'opacity 0.3s ease-out' : 'none' } : undefined}
      />

      {/* Featured glow ring */}
      {isFeatured && (
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(2rem+4xl)] h-[92vh] rounded-3xl bg-gradient-to-br from-amber-400/10 via-transparent to-amber-400/10 blur-2xl" />
        </div>
      )}

      {/* Modal — wider on desktop for 2-col product layout */}
      <div
        ref={modalRef}
        className={`relative w-full md:max-w-2xl lg:max-w-4xl bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] md:max-h-[90vh] overflow-hidden ${entryDone ? '' : 'animate-slide-up'} flex flex-col md:flex-row ${isFeatured ? 'ring-2 ring-amber-400/40 dark:ring-amber-500/30 md:shadow-[0_0_60px_rgba(245,158,11,0.08)]' : ''}`}
        style={swipeDragY > 0 ? { transform: `translateY(${swipeDragY}px)`, transition: swipeAnimating ? 'transform 0.25s ease-out' : 'none' } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Featured top accent bar */}
        {isFeatured && (
          <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 md:rounded-t-2xl" />
        )}

        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className={`w-12 h-1.5 rounded-full ${isFeatured ? 'bg-amber-300 dark:bg-amber-700' : 'bg-slate-300 dark:bg-neutral-600'}`} />
        </div>

        {/* Close button */}
        <button
          onClick={animatedClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 transition-colors"
        >
          <X className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
        </button>

        {/* ── Image Section ── */}
        {step !== 'confirmed' && step !== 'processing' && (
          <div className="md:w-1/2 lg:w-[55%] md:bg-slate-50 md:dark:bg-neutral-800/50 flex flex-col shrink-0">
            {allImages.length > 0 ? (
              <>
                <div
                  className={`relative ${step === 'form' ? 'h-32' : 'aspect-[4/3] md:aspect-auto md:flex-1 md:min-h-[300px]'} overflow-hidden group transition-all duration-300`}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Blurred backdrop — diffused version of current image fills empty space */}
                  <img
                    src={allImages[currentImageIndex]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-3xl scale-150 opacity-80 dark:opacity-70 pointer-events-none saturate-150"
                    draggable={false}
                  />
                  {/* Subtle overlay to soften the blur — light enough to let image color bleed through */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-neutral-900/10 pointer-events-none" />

                  <div
                    className="relative flex h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                  >
                    {allImages.map((url, i) => (
                      <div key={i} className="relative w-full h-full flex-shrink-0 md:p-2 cursor-zoom-in" onClick={() => { if (step === 'detail') setZoomOpen(true); }}>
                        <Image
                          src={url}
                          alt={`${product.name} ${i + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 1200px"
                          quality={95}
                          priority={i === 0}
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Arrows */}
                  {hasMultipleImages && step === 'detail' && (
                    <>
                      <button onClick={() => goTo(currentImageIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-md flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"><ChevronLeft className="h-4 w-4 text-slate-700 dark:text-neutral-200" /></button>
                      <button onClick={() => goTo(currentImageIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-md flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"><ChevronRight className="h-4 w-4 text-slate-700 dark:text-neutral-200" /></button>
                    </>
                  )}

                  {/* Badges on image */}
                  {step === 'detail' && (hasDiscount || isFeatured) && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25">
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          Destacado
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)] text-xs font-bold shadow-md"><Tag className="h-3 w-3" />-{discountPercent}%</span>
                      )}
                    </div>
                  )}

                  {/* Zoom hint */}
                  {step === 'detail' && (
                    <button
                      onClick={() => setZoomOpen(true)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-md flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <ZoomIn className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                    </button>
                  )}
                </div>

                {/* Thumbnails strip */}
                {hasMultipleImages && step === 'detail' && (
                  <div className="flex gap-2 px-4 md:px-3 py-2.5 md:py-3 overflow-x-auto border-t border-slate-100 dark:border-neutral-700/60 bg-white dark:bg-neutral-900 md:bg-transparent md:dark:bg-transparent">
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          i === currentImageIndex ? 'border-[hsl(var(--tenant-primary-500))] shadow-md' : 'border-slate-200 dark:border-neutral-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={`aspect-[4/3] md:aspect-auto md:flex-1 md:min-h-[300px] ${styleConfig.modalFallbackGradient} flex items-center justify-center`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">{product.name.charAt(0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Fullscreen Image Zoom Viewer ── */}
        {zoomOpen && allImages.length > 0 && (
          <FullscreenZoomViewer
            images={allImages}
            currentIndex={currentImageIndex}
            productName={product.name}
            onClose={() => setZoomOpen(false)}
            onChangeIndex={goTo}
          />
        )}

        {/* ── Content Section (scrollable) ── */}
        <div className={`${step !== 'confirmed' && step !== 'processing' ? 'md:w-1/2 lg:w-[45%]' : 'w-full'} overflow-y-auto flex-1`}>
          <div ref={contentRef} className="p-5 md:p-6">

          {/* ======== STEP: DETAIL ======== */}
          {step === 'detail' && (
            <>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {product.name}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    title="Compartir por WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      shareCopied
                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                        : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700'
                    }`}
                    title={shareCopied ? 'Link copiado!' : 'Copiar link'}
                  >
                    {shareCopied
                      ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      : <Share2 className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                    }
                  </button>
                </div>
              </div>
              {shareCopied && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                  <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Link copiado — pegalo donde quieras</span>
                </div>
              )}
              {category && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-500 dark:text-neutral-400">
                    <Tag className="h-3 w-3" />
                    {category.name}
                  </span>
                </div>
              )}

              {/* Savings banner */}
              {hasDiscount && (
                <div className="mb-5 p-3 rounded-xl bg-[hsl(var(--tenant-primary-500)_/_0.06)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.1)] border border-[hsl(var(--tenant-primary-500)_/_0.15)] dark:border-[hsl(var(--tenant-primary-500)_/_0.2)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tenant-primary-500)_/_0.12)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.2)] flex items-center justify-center">
                        <Tag className="h-4 w-4 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]">{discountPercent}% OFF</p>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">Ahorrás {formatPrice(comparePrice! - price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs line-through text-slate-400 dark:text-neutral-500">{formatPrice(comparePrice!)}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(price)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Property description intelligence — computed once, used by ficha + description */}
              {(() => {
                const _attrs = (product as any).attributes as ProductAttribute[] | undefined;
                const _rawDesc = product.description || product.shortDescription || '';
                const _intel = _rawDesc && _attrs?.length ? processPropertyDescription(_rawDesc, _attrs) : null;
                // Store on product for access in description section below
                (product as any).__intel = _intel;
                return null;
              })()}

              {/* Ficha Técnica — structured property sheet */}
              {(product as any).attributes?.length > 0 && (() => {
                const attrs = (product as any).attributes as ProductAttribute[];
                const getVal = (key: string) => attrs.find(a => a.key === key)?.value;
                const operacion = getVal('operacion');
                const tipo = getVal('tipo_propiedad');
                const intel = (product as any).__intel as PropertyIntel | null;

                // Hero stats: key numeric/area data shown as mini cards
                const heroKeys = ['ambientes', 'dormitorios', 'banos', 'cochera', 'm2_totales', 'superficie_cubierta', 'superficie_terreno'];
                const heroIconComponents: Record<string, React.ReactNode> = {
                  ambientes: <LayoutGrid className="h-5 w-5" />,
                  dormitorios: <BedDouble className="h-5 w-5" />,
                  banos: <Bath className="h-5 w-5" />,
                  cochera: <Car className="h-5 w-5" />,
                  cocheras: <Car className="h-5 w-5" />,
                  m2_totales: <Maximize2 className="h-5 w-5" />,
                  superficie_cubierta: <Ruler className="h-5 w-5" />,
                  superficie_terreno: <LandPlot className="h-5 w-5" />,
                  plantas: <Building2 className="h-5 w-5" />,
                  pileta: <Waves className="h-5 w-5" />,
                };
                // Map intel labels → hero keys for promotion
                const heroLabelMap: Record<string, string> = { 'dormitorios': 'dormitorios', 'baños': 'banos', 'ambientes': 'ambientes', 'cocheras': 'cochera', 'cochera': 'cochera', 'plantas': 'plantas', 'pileta': 'pileta' };
                const heroAttrs = heroKeys.map(k => attrs.find(a => a.key === k)).filter((a): a is ProductAttribute => !!a && !!a.value);
                // Promote intel-extracted hero-level attrs (dormitorios, baños, etc. found in description)
                const heroExistingKeys = new Set(heroAttrs.map(a => a.key));
                if (intel) {
                  for (const ea of intel.extractedAttrs) {
                    const heroKey = heroLabelMap[ea.label.toLowerCase()];
                    if (heroKey && !heroExistingKeys.has(heroKey)) {
                      heroAttrs.push({ key: heroKey, label: ea.label, value: ea.value, type: 'text' } as ProductAttribute);
                      heroExistingKeys.add(heroKey);
                    }
                  }
                }

                // Boolean flags
                const booleans = attrs.filter(a => a.type === 'boolean' && a.value === 'true');

                // Keys already handled in hero, badges, or lists
                const handledKeys = new Set([...heroKeys, 'operacion', 'tipo_propiedad', ...attrs.filter(a => a.type === 'boolean').map(a => a.key)]);

                // Sanitize: strip HTML entities + tags → clean text (comma-separated for chips)
                const clean = (s: string) => s
                  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
                  .replace(/<br\s*\/?>/gi, ', ')
                  .replace(/<\/(?:div|p|li|h[1-6])>/gi, ', ')
                  .replace(/<[^>]*>/g, '')
                  .replace(/\s{2,}/g, ' ')
                  .replace(/,\s*,/g, ',')
                  .trim();

                // Classify each attribute into: list (chips) | detail (grid) | skip
                const listAttrs: Array<{ label: string; items: string[] }> = [];
                const detailAttrs: Array<{ label: string; value: string; unit?: string }> = [];
                for (const a of attrs) {
                  if (handledKeys.has(a.key) || !a.value) continue;
                  // "Situación: Vacía" is redundant with product availability — skip it
                  if (/^situacion$/i.test(a.key) && /^vac[ií]a$/i.test(a.value.trim())) continue;
                  const val = clean(a.value);
                  if (!val) continue;
                  // Detect marketing prose in service-type fields — skip if it reads like a sentence
                  // Real service lists: "Agua Corriente, Gas Natural, Electricidad"
                  // Marketing prose: "esenciales como agua corriente, gas natural..."
                  if (/^servicios$/i.test(a.key) && /\b(como|también|además|dispone|incluye|ofrece|asegurando|del hotel|de hotel)\b/i.test(val)) {
                    continue; // marketing prose, not a clean service list
                  }
                  // Try splitting by comma
                  const parts = val.split(',').map((s: string) => s.trim()).filter(Boolean);
                  const avgPartLen = parts.reduce((sum, p) => sum + p.length, 0) / parts.length;
                  if (parts.length >= 3 && avgPartLen <= 30) {
                    // Good chips: multiple short items separated by commas
                    listAttrs.push({ label: a.label, items: parts });
                  } else if (val.length > 60) {
                    // Long text — not useful for ficha, skip
                    continue;
                  } else {
                    detailAttrs.push({ label: a.label, value: val, unit: a.unit });
                  }
                }

                // Merge extracted attrs from description intelligence (skip hero-promoted ones)
                if (intel) {
                  for (const ea of intel.extractedAttrs) {
                    const heroKey = heroLabelMap[ea.label.toLowerCase()];
                    if (heroKey && heroExistingKeys.has(heroKey)) continue; // already in hero cards
                    if (!detailAttrs.some(d => d.label.toLowerCase() === ea.label.toLowerCase())) {
                      detailAttrs.push({ label: ea.label, value: ea.value });
                    }
                  }
                }

                // List color schemes for visual variety
                const listColors = [
                  { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-100 dark:border-teal-800/40' },
                  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-800/40' },
                  { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-100 dark:border-sky-800/40' },
                  { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-100 dark:border-violet-800/40' },
                ];

                return (
                  <div className="mb-5 space-y-3">
                    {/* Operation & Type badges */}
                    {(operacion || tipo) && (
                      <div className="flex flex-wrap gap-2">
                        {operacion && (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase ${
                            operacion === 'Venta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : operacion === 'Alquiler' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          }`}>{operacion}</span>
                        )}
                        {tipo && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {tipo}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hero stats — mini cards */}
                    {heroAttrs.length > 0 && (
                      <div className={`grid gap-2 ${heroAttrs.length <= 2 ? 'grid-cols-2' : heroAttrs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                        {heroAttrs.map(attr => (
                          <div key={attr.key} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/50">
                            <div className="w-9 h-9 rounded-full bg-[hsl(var(--tenant-primary-500)_/_0.08)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.15)] flex items-center justify-center mb-1 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">
                              {heroIconComponents[attr.key] || <Package className="h-5 w-5" />}
                            </div>
                            <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                              {attr.value}{attr.unit ? <span className="text-xs font-normal text-slate-400 dark:text-neutral-500 ml-0.5">{attr.unit}</span> : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">{attr.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detail items — compact 2-col grid (scalar values only) */}
                    {detailAttrs.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {detailAttrs.map((attr, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50/70 dark:bg-neutral-800/40">
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider min-w-0 shrink-0">{attr.label}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200 ml-auto text-right truncate">
                              {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List attributes (Servicios, Amenities, etc.) — chips */}
                    {listAttrs.map((list, idx) => {
                      const color = listColors[idx % listColors.length];
                      return (
                        <div key={list.label}>
                          <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">{list.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {list.items.map(item => (
                              <span key={item} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${color.bg} ${color.text} border ${color.border}`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Boolean flags — compact badges */}
                    {booleans.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {booleans.map(attr => (
                          <span key={attr.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                            <CheckCircle2 className="h-3 w-3" />
                            {attr.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Description — uses intel-cleaned version when available */}
              {(product.description || product.shortDescription) && (() => {
                const intel = (product as any).__intel as PropertyIntel | null;
                const text = intel?.cleanDescription || cleanHtml(product.description || product.shortDescription || '');
                return text ? (
                  <div className="mb-5">
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                      {text}
                    </p>
                  </div>
                ) : null;
              })()}

              {/* Variants — selectable */}
              {activeVariants.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Opciones disponibles
                  </h3>
                  <div className="space-y-1.5">
                    {activeVariants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(selectedVariant === v.id ? null : v.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          selectedVariant === v.id
                            ? 'bg-[hsl(var(--tenant-primary-500))]/10 border-2 border-[hsl(var(--tenant-primary-500))]'
                            : 'bg-slate-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedVariant === v.id
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500))]'
                              : 'border-slate-300 dark:border-neutral-600'
                          }`}>
                            {selectedVariant === v.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                            {v.name}: {v.value}
                          </span>
                        </div>
                        {v.price != null && showPrices && (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(Number(v.price))}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product details */}
              {(() => {
                const details: { label: string; value: string }[] = [];
                if (product.sku) details.push({ label: 'Código', value: product.sku });
                if (product.trackInventory && product.stock > 0) {
                  details.push({ label: 'Disponibilidad', value: product.stock > product.lowStockThreshold ? 'En stock' : `¡Quedan ${product.stock}!` });
                } else if (product.trackInventory && product.stock <= 0) {
                  details.push({ label: 'Disponibilidad', value: 'Sin stock' });
                } else if (!product.trackInventory) {
                  details.push({ label: 'Disponibilidad', value: 'Disponible' });
                }
                if (product.type === 'digital') details.push({ label: 'Tipo', value: 'Producto digital' });
                if (details.length === 0) return null;
                return (
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400" />
                      </div>
                      Detalles del producto
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {details.map((d, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/50">
                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider">{d.label}</p>
                          <p className={`text-sm font-medium ${
                            d.value === 'Sin stock' ? 'text-red-500' :
                            d.value === 'Disponible' ? 'text-emerald-600 dark:text-emerald-400' :
                            d.value.startsWith('¡Quedan') ? 'text-amber-600 dark:text-amber-400' :
                            'text-slate-700 dark:text-neutral-300'
                          }`}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Price summary (no discount) */}
              {showPrices && price > 0 && !hasDiscount && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[hsl(var(--tenant-primary-500)_/_0.06)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.1)] text-center">
                    <CreditCard className="h-5 w-5 mx-auto mb-1 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]" />
                    <p className="text-xs text-slate-500 dark:text-neutral-400">Precio</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formatPrice(effectivePrice)}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Primary CTA: Buy Now (goes to form) */}
                {hasMercadoPago && price > 0 && !outOfStock && (
                  <button
                    onClick={() => setStep('form')}
                    className={`w-full h-12 ${styleConfig.modalCtaBtnClasses} font-semibold rounded-xl flex items-center justify-center gap-2`}
                  >
                    Comprar ahora — {formatPrice(effectivePrice)}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                )}

                {outOfStock && (
                  <div className="w-full h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 font-semibold flex items-center justify-center cursor-not-allowed">
                    Sin stock
                  </div>
                )}

                {/* WhatsApp CTA */}
                {whatsappNumber && (
                  <button
                    onClick={onWhatsApp}
                    className={`w-full h-12 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                      hasMercadoPago && price > 0 && !outOfStock
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Consultar por WhatsApp
                  </button>
                )}

                <button
                  onClick={animatedClose}
                  className="w-full h-11 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 font-medium rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  Cerrar
                </button>
              </div>
            </>
          )}

          {/* ======== STEP: FORM (Customer Data + Shipping) ======== */}
          {step === 'form' && (
            <>
              {/* Back + title */}
              <button
                onClick={() => { setStep('detail'); setSubmitError(null); }}
                className="flex items-center gap-1 text-sm text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 mb-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver al producto
              </button>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Completá tus datos
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mb-5">
                Para procesar tu compra de <span className="font-medium text-slate-700 dark:text-neutral-300">{product.name}</span>
              </p>

              {/* Error banner */}
              {submitError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                </div>
              )}

              {/* Customer form */}
              <div className="space-y-4 mb-6">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => { setCustomerForm(prev => ({ ...prev, name: e.target.value })); setFormErrors(prev => ({ ...prev, name: '' })); }}
                    placeholder="Tu nombre"
                    className={`w-full h-11 px-4 rounded-xl border text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.name
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                        : 'border-slate-200 dark:border-neutral-700 focus:ring-[hsl(var(--tenant-primary-500))]/30 focus:border-[hsl(var(--tenant-primary-500))]'
                    }`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    WhatsApp / Teléfono <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => { setCustomerForm(prev => ({ ...prev, phone: e.target.value })); setFormErrors(prev => ({ ...prev, phone: '' })); }}
                    placeholder="11 1234-5678"
                    className={`w-full h-11 px-4 rounded-xl border text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.phone
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                        : 'border-slate-200 dark:border-neutral-700 focus:ring-[hsl(var(--tenant-primary-500))]/30 focus:border-[hsl(var(--tenant-primary-500))]'
                    }`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email <span className="text-xs text-slate-400">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => { setCustomerForm(prev => ({ ...prev, email: e.target.value })); setFormErrors(prev => ({ ...prev, email: '' })); }}
                    placeholder="tu@email.com"
                    className={`w-full h-11 px-4 rounded-xl border text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.email
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                        : 'border-slate-200 dark:border-neutral-700 focus:ring-[hsl(var(--tenant-primary-500))]/30 focus:border-[hsl(var(--tenant-primary-500))]'
                    }`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Nota o consulta <span className="text-xs text-slate-400">(opcional)</span>
                  </label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Algún detalle, talle, color, consulta..."
                    rows={2}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))]/30 focus:border-[hsl(var(--tenant-primary-500))] resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Shipping options */}
              {hasAnyShipping && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    ¿Cómo recibís tu compra?
                  </h3>

                  <div className="space-y-2">
                    {/* Pickup */}
                    {hasPickup && (
                      <button
                        type="button"
                        onClick={() => { setShippingMethod('retiro'); setFormErrors(prev => ({ ...prev, shipping: '' })); }}
                        className={`w-full p-3.5 rounded-xl text-left transition-all ${
                          shippingMethod === 'retiro'
                            ? 'bg-[hsl(var(--tenant-primary-500))]/10 border-2 border-[hsl(var(--tenant-primary-500))]'
                            : 'bg-slate-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            shippingMethod === 'retiro'
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500))]'
                              : 'border-slate-300 dark:border-neutral-600'
                          }`}>
                            {shippingMethod === 'retiro' && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-neutral-200">Retiro en el local</p>
                            {shippingConfig?.pickup?.address && (
                              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {shippingConfig.pickup.address}
                              </p>
                            )}
                            {shippingConfig?.pickup?.hours && (
                              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                                {shippingConfig.pickup.hours}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Delivery */}
                    {hasDelivery && (
                      <button
                        type="button"
                        onClick={() => { setShippingMethod('envio'); setFormErrors(prev => ({ ...prev, shipping: '' })); }}
                        className={`w-full p-3.5 rounded-xl text-left transition-all ${
                          shippingMethod === 'envio'
                            ? 'bg-[hsl(var(--tenant-primary-500))]/10 border-2 border-[hsl(var(--tenant-primary-500))]'
                            : 'bg-slate-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            shippingMethod === 'envio'
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500))]'
                              : 'border-slate-300 dark:border-neutral-600'
                          }`}>
                            {shippingMethod === 'envio' && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-neutral-200">Envío a domicilio</p>
                            {shippingConfig?.delivery?.info && (
                              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 whitespace-pre-line">
                                {shippingConfig.delivery.info}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Meeting point */}
                    {hasMeetingPoint && (
                      <button
                        type="button"
                        onClick={() => { setShippingMethod('punto_encuentro'); setFormErrors(prev => ({ ...prev, shipping: '' })); }}
                        className={`w-full p-3.5 rounded-xl text-left transition-all ${
                          shippingMethod === 'punto_encuentro'
                            ? 'bg-[hsl(var(--tenant-primary-500))]/10 border-2 border-[hsl(var(--tenant-primary-500))]'
                            : 'bg-slate-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            shippingMethod === 'punto_encuentro'
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500))]'
                              : 'border-slate-300 dark:border-neutral-600'
                          }`}>
                            {shippingMethod === 'punto_encuentro' && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-neutral-200">Punto de encuentro</p>
                            {shippingConfig?.meetingPoint?.info && (
                              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 whitespace-pre-line">
                                {shippingConfig.meetingPoint.info}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                  {formErrors.shipping && <p className="text-xs text-red-500 mt-1.5">{formErrors.shipping}</p>}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2 block">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-lg font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => product.trackInventory ? Math.min(product.stock, q + 1) : q + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-lg font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Resumen</h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-neutral-400">
                    {quantity}x {product.name}
                    {selectedVariantObj ? ` (${selectedVariantObj.value})` : ''}
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-neutral-200">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500">
                  <span>
                    Entrega: {shippingMethod === 'retiro' ? 'Retiro en local' : shippingMethod === 'envio' ? 'Envío a coordinar' : shippingMethod === 'punto_encuentro' ? 'Punto de encuentro' : 'A definir'}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-neutral-700 mt-3 pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Submit */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmitOrder}
                  className={`w-full h-12 ${styleConfig.modalCtaBtnClasses} font-semibold rounded-xl flex items-center justify-center gap-2`}
                >
                  {hasMercadoPago ? (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pagar con Mercado Pago — {formatPrice(totalPrice)}
                    </>
                  ) : (
                    <>
                      Confirmar compra — {formatPrice(totalPrice)}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {whatsappNumber && (
                  <p className="text-center text-xs text-slate-400 dark:text-neutral-500 flex items-center justify-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    ¿Dudas? <button onClick={onWhatsApp} className="underline hover:text-green-500 transition-colors">Escribinos por WhatsApp</button>
                  </p>
                )}
              </div>
            </>
          )}

          {/* ======== STEP: PROCESSING ======== */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-[hsl(var(--tenant-primary-500))]" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Procesando tu compra...</h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400">
                {hasMercadoPago ? 'Te redirigimos a Mercado Pago' : 'Estamos confirmando tu pedido'}
              </p>
            </div>
          )}

          {/* ======== STEP: CONFIRMED ======== */}
          {step === 'confirmed' && orderResult && (
            <div className="py-6 text-center">
              {/* Success animation */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                ¡Compra confirmada!
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6">
                Pedido <span className="font-semibold text-slate-700 dark:text-neutral-300">{orderResult.orderNumber}</span>
              </p>

              {/* Order detail card */}
              <div className="text-left p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {allImages[0] && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={allImages[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
                    {selectedVariantObj && (
                      <p className="text-xs text-slate-500 dark:text-neutral-400">{selectedVariantObj.name}: {selectedVariantObj.value}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Cantidad</span>
                    <span className="text-slate-800 dark:text-neutral-200">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Total</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Entrega</span>
                    <span className="text-slate-800 dark:text-neutral-200">
                      {shippingMethod === 'retiro' ? 'Retiro en local' : shippingMethod === 'envio' ? 'Envío a coordinar' : 'Punto de encuentro'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping info */}
              <div className="text-left p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 mb-6">
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {shippingMethod === 'retiro' ? 'Retiro en el local' :
                       shippingMethod === 'envio' ? 'Envío a coordinar' :
                       'Punto de encuentro'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      Te contactaremos por WhatsApp para coordinar los detalles de la entrega.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {whatsappNumber && (
                  <button
                    onClick={onWhatsApp}
                    className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Escribir a {tenantName}
                  </button>
                )}
                <button
                  onClick={animatedClose}
                  className="w-full h-11 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 font-medium rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
