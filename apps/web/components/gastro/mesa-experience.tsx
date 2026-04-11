'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Loader2,
  Search,
  UtensilsCrossed,
  CheckCircle2,
  Banknote,
  CreditCard,
  Smartphone,
  ChevronRight,
  X,
  Send,
  Flame,
  Leaf,
  Star,
  ChevronDown,
  Receipt,
  MapPin,
  Sun,
  Moon,
  Wine,
  Wheat,
  AlertTriangle,
  BookOpen,
  ChefHat,
  Sparkles,
  PartyPopper,
  Heart,
  ArrowUp,
  Beef,
  Salad,
  IceCream,
  Coffee,
  Beer,
  Grape,
  Fish,
  Sandwich,
  Soup,
  Egg,
  Pizza,
  CakeSlice,
  Cherry,
  MessageCircle,
  Instagram,
  ExternalLink,
  ThumbsUp,
  KeyRound,
} from 'lucide-react';
import { useGastroSessionStore } from '@/lib/gastro-session-store';
import type { SessionStatus } from '@/lib/gastro-session-store';
import { useTableSocket } from '@/lib/gastro-socket';
import { formatPrice } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Props {
  tenant: any;
  slug: string;
  tableNumber: number;
  products: any[];
  categories: any[];
}

// ===== CATEGORY THEME MAP =====
// Lucide icons — no generic emojis
const CATEGORY_THEMES: { keywords: string[]; icon: React.ReactNode; accent: string; bg: string }[] = [
  { keywords: ['parrilla', 'asado', 'carne', 'grill'], icon: <Beef className="w-5 h-5" />, accent: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  { keywords: ['entrada', 'aperitivo', 'starter'], icon: <Sparkles className="w-5 h-5" />, accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { keywords: ['ensalada', 'verde', 'salad'], icon: <Salad className="w-5 h-5" />, accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { keywords: ['pasta', 'fideos', 'ñoqui', 'raviole'], icon: <ChefHat className="w-5 h-5" />, accent: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { keywords: ['pizza'], icon: <Pizza className="w-5 h-5" />, accent: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  { keywords: ['pescado', 'mar', 'mariscos', 'sushi', 'fish'], icon: <Fish className="w-5 h-5" />, accent: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { keywords: ['postre', 'dulce', 'dessert', 'torta'], icon: <CakeSlice className="w-5 h-5" />, accent: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  { keywords: ['bebida', 'drink', 'trago', 'cocktail', 'coctel'], icon: <Wine className="w-5 h-5" />, accent: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { keywords: ['vino', 'wine', 'bodega'], icon: <Grape className="w-5 h-5" />, accent: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { keywords: ['cerveza', 'beer', 'birra'], icon: <Beer className="w-5 h-5" />, accent: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { keywords: ['café', 'cafe', 'coffee', 'infusion', 'té'], icon: <Coffee className="w-5 h-5" />, accent: 'text-amber-800 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/20' },
  { keywords: ['minuta', 'sandwich', 'burger', 'hamburguesa', 'lomito', 'milanesa'], icon: <Sandwich className="w-5 h-5" />, accent: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { keywords: ['wok', 'arroz', 'oriental', 'thai', 'chino'], icon: <Flame className="w-5 h-5" />, accent: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  { keywords: ['vegano', 'vegetariano', 'plant'], icon: <Leaf className="w-5 h-5" />, accent: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
  { keywords: ['tapa', 'compartir', 'picada', 'tabla'], icon: <UtensilsCrossed className="w-5 h-5" />, accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { keywords: ['sopa', 'crema', 'caldo'], icon: <Soup className="w-5 h-5" />, accent: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { keywords: ['empanada'], icon: <Egg className="w-5 h-5" />, accent: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { keywords: ['helado', 'ice'], icon: <IceCream className="w-5 h-5" />, accent: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { keywords: ['fruta', 'jugo', 'smoothie'], icon: <Cherry className="w-5 h-5" />, accent: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
];
const DEFAULT_THEME = { icon: <UtensilsCrossed className="w-5 h-5" />, accent: 'text-neutral-700 dark:text-neutral-300', bg: 'bg-neutral-50 dark:bg-neutral-900/50' };

function getCategoryTheme(name: string) {
  const lower = name.toLowerCase();
  return CATEGORY_THEMES.find(t => t.keywords.some(k => lower.includes(k))) || DEFAULT_THEME;
}

// ===== PROMOTIONAL CATEGORY DETECTION =====
// Promotional/editorial categories (offers, seasonal, chef's picks) are marketing
// content — they must NOT appear in taxonomic navigation (ticker + discovery grid),
// where the user expects objective food types. They are still rendered in the
// scrollable menu but with distinctive editorial styling, placed at the top for
// maximum visibility to the merchant's intent.
const PROMOTIONAL_KEYWORDS = /descuent|oferta|promo|\bnuev|verano|invierno|primaver|oto[ñn]o|temporad|destacad|elegid|chef|recomend|selecci[oó]n|imperdibl|\b[úu]ltim|2\s*x\s*1|lanzam|novedad|edici[oó]n|limit|sugerenc/i;

function isPromotionalCategory(name: string): boolean {
  return PROMOTIONAL_KEYWORDS.test(name);
}

// Editorial theme for promotional section headers — distinguishes them from
// taxonomic categories (which use the rubro-based color from CATEGORY_THEMES)
const PROMOTIONAL_THEME = {
  icon: <Sparkles className="w-5 h-5" />,
  accent: 'text-amber-700 dark:text-amber-300',
  bg: 'bg-gradient-to-br from-amber-50 via-amber-50/60 to-rose-50/40 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-rose-950/20',
};

// ===== STATUS HELPERS =====
const ORDER_STATUS: Record<string, { label: string; color: string; dot: string; pulse?: boolean }> = {
  PENDING:   { label: 'Recibido',   color: 'text-amber-600',   dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600',    dot: 'bg-blue-500' },
  PREPARING: { label: 'Preparando', color: 'text-purple-600',  dot: 'bg-purple-500', pulse: true },
  READY:     { label: 'Listo',      color: 'text-emerald-600', dot: 'bg-emerald-500' },
  DELIVERED: { label: 'Entregado',  color: 'text-neutral-400', dot: 'bg-neutral-400' },
};

// Haptic feedback helper
const haptic = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

// ===== CATEGORY TICKER — infinite auto-scroll =====
const CategoryTicker = React.forwardRef<HTMLDivElement, {
  categories: any[];
  groupedProducts: { id: string; name: string; products: any[] }[];
  activeCategory: string | null;
  onSelect: (id: string) => void;
}>(({ categories, groupedProducts, activeCategory, onSelect }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const speedRef = useRef(0.5); // px per frame
  const touchingRef = useRef(false);
  const lastTouchXRef = useRef(0);

  // Expose scrollRef to parent via forwarded ref for data-cat queries
  React.useImperativeHandle(ref, () => scrollRef.current!, []);

  const visibleCats = categories.filter((c: any) => groupedProducts.some(g => g.id === c.id));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || visibleCats.length <= 2) return;

    const animate = () => {
      if (!touchingRef.current && el) {
        el.scrollLeft += speedRef.current;
        // Loop: when scrolled past halfway (duplicate content), reset
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
        if (el.scrollLeft < 0) {
          el.scrollLeft += halfWidth;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [visibleCats.length]);

  // Touch handlers: user can swipe to accelerate
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchingRef.current = true;
    lastTouchXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const dx = lastTouchXRef.current - e.touches[0].clientX;
    lastTouchXRef.current = e.touches[0].clientX;
    scrollRef.current.scrollLeft += dx;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchingRef.current = false;
  }, []);

  // Duplicate items for seamless loop
  const items = [...visibleCats, ...visibleCats];

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-hidden flex-1"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((cat: any, i: number) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={`${cat.id}-${i}`}
            data-cat={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-5 py-2 rounded-full text-[12.5px] font-semibold tracking-wide transition-all duration-200 ${
              isActive
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                : 'bg-transparent text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
});
CategoryTicker.displayName = 'CategoryTicker';

export function MesaExperience({ tenant, slug, tableNumber, products, categories }: Props) {
  const store = useGastroSessionStore();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [requestingBill, setRequestingBill] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const [tipType, setTipType] = useState<'percentage' | 'fixed' | 'none'>('percentage');
  const [tipValue, setTipValue] = useState<number>(15);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mercadopago' | 'card' | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: number; itemCount: number } | null>(null);
  const [lastOrderTime, setLastOrderTime] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [allDelivered, setAllDelivered] = useState(false);
  const [showPreparingOverlay, setShowPreparingOverlay] = useState(false);
  const [showDeliveredOverlay, setShowDeliveredOverlay] = useState(false);
  const [deliveredOverlayPartial, setDeliveredOverlayPartial] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewSent, setReviewSent] = useState(false);
  const [comensalEmail, setComensalEmail] = useState('');
  const [comensalName, setComensalName] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [farewellConfig, setFarewellConfig] = useState<any>(null);
  const [sessionWord, setSessionWord] = useState<string | null>(null);
  const [requiresWord, setRequiresWord] = useState<{ sessionId: string; tableNumber: number } | null>(null);
  const [wordInput, setWordInput] = useState('');
  const [wordError, setWordError] = useState<string | null>(null);
  const [joiningSession, setJoiningSession] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const settings = tenant.settings as any;
  const currency = settings?.currency || 'ARS';
  const coverImage = tenant.coverImage;
  const tipOptions = settings?.gastroConfig?.tipOptions || [10, 15, 20];

  // ===== THEME =====
  useEffect(() => {
    // Check system preference or localStorage
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('turnolink-mesa-theme') : null;
    if (saved === 'dark' || (!saved && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (typeof localStorage !== 'undefined') localStorage.setItem('turnolink-mesa-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);

  // ===== DETECT MP RETURN =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      // MP redirected back after successful payment — set status to PAID
      // The webhook may take a moment to process, but the session will load the real status
      store.setStatus('PAID');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'failure') {
      setError('El pago no pudo procesarse. Podés intentar de nuevo o elegir otro método.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'pending') {
      store.setStatus('WAITING_PAYMENT');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== INITIALIZE SESSION =====
  useEffect(() => {
    async function initSession() {
      try {
        // If store has a stale session (PAID/CLOSED or different table), reset it
        if (
          store.sessionId &&
          (store.status === 'PAID' || store.status === 'CLOSED' ||
           store.tableNumber !== tableNumber || store.tenantId !== tenant.id)
        ) {
          store.reset();
        }

        // If we already have a valid session in the store for this table, skip opening
        if (store.sessionId && store.tableNumber === tableNumber && store.tenantId === tenant.id) {
          const checkRes = await fetch(`${API_URL}/api/gastro/session/${store.sessionId}`);
          if (checkRes.ok) {
            const existing = await checkRes.json();
            if (existing.status !== 'PAID' && existing.status !== 'CLOSED') {
              setSessionWord(existing.sessionWord || null);
              if (existing.farewellConfig) setFarewellConfig(existing.farewellConfig);
              const orders = (existing.orders || []).map((o: any) => ({
                id: o.id, orderNumber: o.orderNumber, items: o.items,
                subtotal: Number(o.subtotal), status: o.status, createdAt: o.createdAt,
              }));
              store.setOrders(orders);
              if (orders.length > 0 && orders.every((o: any) => o.status === 'DELIVERED')) setAllDelivered(true);
              if (['WAITING_PAYMENT', 'BILL_REQUESTED', 'PAYMENT_ENABLED'].includes(existing.status)) {
                loadBill(); setShowBill(true);
              }
              setLoading(false);
              return;
            }
          }
          store.reset();
        }

        const res = await fetch(`${API_URL}/api/gastro/session/open`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: tenant.id, tableNumber }),
        });
        if (!res.ok) throw new Error('Error al abrir sesión');
        const session = await res.json();

        // If there's already an active session, the backend returns { requiresWord }
        if (session.requiresWord) {
          setRequiresWord({ sessionId: session.sessionId, tableNumber: session.tableNumber });
          setLoading(false);
          return;
        }

        store.setSession(session.id, tenant.id, tableNumber, session.status);
        setSessionWord(session.sessionWord || null);
        if (session.farewellConfig) setFarewellConfig(session.farewellConfig);
        const orders = (session.orders || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          items: o.items,
          subtotal: Number(o.subtotal),
          status: o.status,
          createdAt: o.createdAt,
        }));
        store.setOrders(orders);
        if (orders.length > 0 && orders.every((o: any) => o.status === 'DELIVERED')) {
          setAllDelivered(true);
        }
        if (session.status === 'WAITING_PAYMENT' || session.status === 'BILL_REQUESTED' || session.status === 'PAYMENT_ENABLED') {
          loadBill();
          setShowBill(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [tenant.id, tableNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== INTERSECTION OBSERVER FOR CATEGORY SYNC =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace('section-', ''));
            const btn = categoryScrollRef.current?.querySelector(`[data-cat="${entry.target.id.replace('section-', '')}"]`);
            btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, products]);

  // ===== SCROLL-TO-TOP BUTTON =====
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== FILTERED & GROUPED PRODUCTS =====
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p: any) => p.isActive);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [products, search]);

  const groupedProducts = useMemo(() => {
    const groups: { id: string; name: string; products: any[] }[] = [];
    const catMap = new Map<string, any[]>();
    const uncategorized: any[] = [];

    for (const p of filteredProducts) {
      if (p.categoryId && p.category) {
        if (!catMap.has(p.categoryId)) catMap.set(p.categoryId, []);
        catMap.get(p.categoryId)!.push(p);
      } else {
        uncategorized.push(p);
      }
    }

    // Preserve category order from the categories prop
    for (const cat of categories) {
      const prods = catMap.get(cat.id);
      if (prods && prods.length > 0) {
        groups.push({ id: cat.id, name: cat.name, products: prods });
      }
    }
    if (uncategorized.length > 0) {
      groups.push({ id: 'otros', name: 'Otros', products: uncategorized });
    }
    return groups;
  }, [filteredProducts, categories]);

  // Split groups into taxonomic (food types) and promotional (offers, seasonal, chef's picks).
  // Taxonomic feed the navigation (ticker + "Nuestra carta"); promotional are rendered at the
  // top of the scrollable menu with distinctive editorial styling.
  const { taxonomicGroups, promotionalGroups } = useMemo(() => {
    const taxonomic: typeof groupedProducts = [];
    const promotional: typeof groupedProducts = [];
    for (const g of groupedProducts) {
      if (isPromotionalCategory(g.name)) promotional.push(g);
      else taxonomic.push(g);
    }
    return { taxonomicGroups: taxonomic, promotionalGroups: promotional };
  }, [groupedProducts]);

  // Final render order for scrollable menu: promotional first (high visibility), then taxonomic
  const orderedGroups = useMemo(
    () => [...promotionalGroups, ...taxonomicGroups],
    [promotionalGroups, taxonomicGroups],
  );

  // Featured products (isFeatured or first 4 with images)
  const featuredProducts = useMemo(() => {
    const featured = products.filter((p: any) => p.isActive && p.isFeatured && p.images?.length > 0);
    if (featured.length >= 2) return featured.slice(0, 6);
    return products.filter((p: any) => p.isActive && p.images?.length > 0).slice(0, 4);
  }, [products]);

  // ===== HANDLERS =====
  const toggleSection = useCallback((catId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
    haptic();
  }, []);

  const scrollToCategory = useCallback((catId: string) => {
    // Auto-expand if collapsed — otherwise the scroll target jumps to an
    // empty header and the user sees nothing, which is confusing.
    setCollapsedSections((prev) => {
      if (!prev.has(catId)) return prev;
      const next = new Set(prev);
      next.delete(catId);
      return next;
    });
    // Defer scroll so the layout reflows after expand before measuring.
    requestAnimationFrame(() => {
      const el = sectionRefs.current.get(catId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
    setActiveCategory(catId);
  }, []);

  const addToCart = useCallback((product: any, qty: number = 1) => {
    for (let i = 0; i < qty; i++) {
      store.addCurrentItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
      });
    }
    haptic();
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 400);
  }, [store]);

  const handleSendOrder = useCallback(async () => {
    if (!store.sessionId || store.currentItems.length === 0) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: store.currentItems }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al enviar pedido');
      }
      const order = await res.json();
      const itemCount = store.currentItems.reduce((sum, i) => sum + i.quantity, 0);
      store.addSentOrder({
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        subtotal: Number(order.subtotal),
        status: order.status,
        createdAt: order.createdAt,
      });
      store.clearCurrentItems();
      store.setStatus('ORDERING');
      setShowCart(false);
      setLastOrderTime(Date.now());
      haptic();
      // Show success animation
      setOrderSuccess({ orderNumber: order.orderNumber, itemCount });
      setTimeout(() => setOrderSuccess(null), 4000);
    } catch (err: any) {
      // If session was closed, re-open and retry once
      if (err.message?.includes('cerrada') || err.message?.includes('closed')) {
        try {
          const reopenRes = await fetch(`${API_URL}/api/gastro/session/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: store.tenantId, tableNumber: store.tableNumber }),
          });
          if (reopenRes.ok) {
            const newSession = await reopenRes.json();
            store.setSession(newSession.id, store.tenantId!, store.tableNumber!, newSession.status);
            store.setOrders([]);
            // Retry the order with new sessionId
            const retryRes = await fetch(`${API_URL}/api/gastro/session/${newSession.id}/order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: store.currentItems }),
            });
            if (retryRes.ok) {
              const order = await retryRes.json();
              const itemCount = store.currentItems.reduce((sum, i) => sum + i.quantity, 0);
              store.addSentOrder({
                id: order.id, orderNumber: order.orderNumber, items: order.items,
                subtotal: Number(order.subtotal), status: order.status, createdAt: order.createdAt,
              });
              store.clearCurrentItems();
              store.setStatus('ORDERING');
              setShowCart(false);
              setLastOrderTime(Date.now());
              haptic();
              setOrderSuccess({ orderNumber: order.orderNumber, itemCount });
              setTimeout(() => setOrderSuccess(null), 4000);
              return;
            }
          }
        } catch { /* fall through to show original error */ }
      }
      setError(err.message);
    } finally {
      setSending(false);
    }
  }, [store]);

  const handleRequestBill = useCallback(async () => {
    if (!store.sessionId) return;
    setRequestingBill(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/request-bill`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al solicitar cuenta');
      }
      store.setStatus('BILL_REQUESTED');
      await loadBill();
      setShowBill(true);
      setShowOrders(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequestingBill(false);
    }
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinSession = async () => {
    if (!requiresWord || !wordInput.trim()) return;
    setJoiningSession(true);
    setWordError(null);
    try {
      const res = await fetch(`${API_URL}/api/gastro/session/${requiresWord.sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: wordInput.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setWordError(err.message || 'Palabra incorrecta');
        return;
      }
      const session = await res.json();
      store.setSession(session.id, tenant.id, tableNumber, session.status);
      setSessionWord(session.sessionWord || null);
      setRequiresWord(null);
      setWordInput('');
      if (session.farewellConfig) setFarewellConfig(session.farewellConfig);
      const orders = (session.orders || []).map((o: any) => ({
        id: o.id, orderNumber: o.orderNumber, items: o.items,
        subtotal: Number(o.subtotal), status: o.status, createdAt: o.createdAt,
      }));
      store.setOrders(orders);
      if (orders.length > 0 && orders.every((o: any) => o.status === 'DELIVERED')) setAllDelivered(true);
      if (['WAITING_PAYMENT', 'BILL_REQUESTED', 'PAYMENT_ENABLED'].includes(session.status)) {
        loadBill(); setShowBill(true);
      }
    } catch {
      setWordError('Error al unirse. Intentá de nuevo.');
    } finally {
      setJoiningSession(false);
    }
  };

  const loadBill = useCallback(async () => {
    if (!store.sessionId) return;
    try {
      const res = await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/bill`);
      if (res.ok) {
        const data = await res.json();
        setBillData(data);
        if (data.session?.status) store.setStatus(data.session.status);
      }
    } catch {}
  }, [store]);

  const handlePay = useCallback(async (method: 'cash' | 'mercadopago' | 'card') => {
    if (!store.sessionId) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipType, tipValue: tipType === 'none' ? 0 : tipValue, paymentMethod: method }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al procesar pago');
      }
      const result = await res.json();
      if (method === 'mercadopago' && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      store.setStatus('WAITING_PAYMENT');
      setPaymentMethod(method);
      setBillData((prev: any) => ({ ...prev, ...result, selectedMethod: method }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }, [store, tipType, tipValue]);

  // ===== WEBSOCKET =====
  useTableSocket({
    sessionId: store.sessionId,
    onOrderDelivered: useCallback((data: any) => {
      // Use getState() to avoid stale closure — store.orders would capture the value at callback creation time
      const currentOrders = useGastroSessionStore.getState().orders;
      if (data.orderId) {
        store.setOrders(currentOrders.map(o =>
          o.id === data.orderId ? { ...o, status: 'DELIVERED' } : o
        ));
      }
      // If all orders delivered, comensal can now request the bill
      if (data.allDelivered) {
        setAllDelivered(true);
        setShowDeliveredOverlay(true);
      } else {
        setShowDeliveredOverlay(true);
        setDeliveredOverlayPartial(true);
      }
    }, [store]),
    onPaymentEnabled: useCallback(() => { store.setStatus('PAYMENT_ENABLED'); loadBill(); }, [store, loadBill]),
    onPaid: useCallback(() => store.setStatus('PAID'), [store]),
    onClosed: useCallback(() => store.setStatus('CLOSED'), [store]),
    onStatusChanged: useCallback((data: any) => {
      if (data.status) {
        store.setStatus(data.status);
        if (data.status === 'PAYMENT_ENABLED') loadBill();
      }
    }, [store, loadBill]),
  });

  // Fallback polling for bill status
  useEffect(() => {
    if (store.status !== 'BILL_REQUESTED') return;
    const interval = setInterval(() => loadBill(), 10000);
    return () => clearInterval(interval);
  }, [store.status, loadBill]);

  const sessionTotal = store.getSessionTotal();
  const currentTotal = store.getCurrentTotal();
  const currentCount = store.getCurrentCount();
  const hasOrders = store.orders.length > 0;

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-neutral-300 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-900">Preparando tu mesa</p>
            <p className="text-xs text-neutral-400 mt-1">Mesa {tableNumber}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && !store.sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">No pudimos abrir tu mesa</h1>
          <p className="text-sm text-neutral-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ===== SESSION WORD GATE =====
  if (requiresWord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5">
            <KeyRound className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Mesa {requiresWord.tableNumber}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            Esta mesa tiene una sesión activa.<br />
            Pedile la <span className="font-semibold text-neutral-700 dark:text-neutral-200">palabra clave</span> a alguien de tu mesa para unirte.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => { setWordInput(e.target.value.toUpperCase()); setWordError(null); }}
              placeholder="Ej: MATE"
              maxLength={10}
              autoFocus
              className="w-full text-center text-2xl font-bold tracking-[0.2em] py-4 px-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all uppercase placeholder:text-neutral-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
            />
            {wordError && (
              <p className="text-sm text-red-500 font-medium">{wordError}</p>
            )}
            <button
              onClick={handleJoinSession}
              disabled={!wordInput.trim() || joiningSession}
              className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-base disabled:opacity-40 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              {joiningSession ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Unirme a la mesa</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== WAITING FOR MOZO (cash/card selected) =====
  // If status is WAITING_PAYMENT but no paymentMethod was set (e.g., re-scanned QR after closing MP),
  // fall through to bill view so the comensal can choose again.
  if (store.status === 'WAITING_PAYMENT' && paymentMethod) {
    const methodLabel = paymentMethod === 'mercadopago' ? 'Mercado Pago' : paymentMethod === 'card' ? 'tarjeta' : 'efectivo';
    const MethodIcon = paymentMethod === 'mercadopago' ? Smartphone : paymentMethod === 'card' ? CreditCard : Banknote;
    const grandTotalDisplay = billData?.grandTotal || (Number(billData?.totalAmount || 0) + Number(billData?.tipAmount || 0));
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm w-full text-center space-y-8"
        >
          {/* Animated icon with ripple */}
          <div className="relative w-28 h-28 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-200/40"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-200/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/25"
            >
              <MethodIcon className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Pago con {methodLabel}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-[15px] leading-relaxed">
              {paymentMethod === 'mercadopago'
                ? 'El mozo se acercará a tu mesa para procesar el pago.'
                : 'El mozo se acercará a tu mesa para cobrarte.'}
              <br />
              <span className="text-neutral-400 dark:text-neutral-500 text-sm">No te vayas todavía.</span>
            </p>
          </motion.div>

          {billData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 text-left space-y-3 shadow-lg shadow-neutral-900/5 dark:shadow-none border border-neutral-100 dark:border-neutral-800"
            >
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(Number(billData.totalAmount), currency)}</span>
              </div>
              {Number(billData.tipAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Propina</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatPrice(Number(billData.tipAmount), currency)}</span>
                </div>
              )}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex justify-between text-xl font-bold">
                <span className="text-neutral-900 dark:text-white">Total</span>
                <span className="text-neutral-900 dark:text-white">{formatPrice(grandTotalDisplay, currency)}</span>
              </div>
            </motion.div>
          )}

          {/* Animated waiting indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 rounded-full">
              <div className="relative">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-1 h-1 bg-amber-600 dark:bg-amber-400 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2" />
                </motion.div>
              </div>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Esperando al mozo</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-amber-500"
              >
                ...
              </motion.span>
            </div>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">Mesa {tableNumber}</p>
          </motion.div>

          {/* Change payment method button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => {
              setPaymentMethod(null);
              store.setStatus('PAYMENT_ENABLED');
              loadBill();
              setShowBill(true);
            }}
            className="text-sm text-neutral-400 dark:text-neutral-500 underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Cambiar método de pago
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ===== PAID / CLOSED — FAREWELL SCREEN =====
  if (store.status === 'PAID' || store.status === 'CLOSED') {
    const paidTotal = billData?.grandTotal || (Number(billData?.totalAmount || 0) + Number(billData?.tipAmount || 0));
    const fwConfig = farewellConfig || billData?.farewellConfig;
    const farewellMessage = fwConfig?.farewellMessage;
    const farewellIncentive = fwConfig?.farewellIncentive;
    const showEmailCapture = fwConfig?.collectEmail !== false;
    const tenantInstagram = (tenant as any).instagram;

    const handleEmailSubmit = async () => {
      if (!comensalEmail.trim() || !store.sessionId) return;
      setSendingEmail(true);
      try {
        await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/collect-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: comensalEmail.trim(), name: comensalName.trim() || undefined }),
        });
        setEmailSent(true);
      } catch {} finally {
        setSendingEmail(false);
      }
    };

    const handleReviewSubmit = async () => {
      if (!reviewText.trim() || !store.sessionId) return;
      try {
        await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review: reviewText.trim() }),
        });
        setReviewSent(true);
      } catch {}
    };

    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950">
        {/* ===== HERO — Full viewport, no scroll needed ===== */}
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: `${10 + (i * 7)}%`, opacity: 0, scale: 0 }}
                animate={{ y: '110vh', opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.5], rotate: [0, 180 + i * 30] }}
                transition={{ duration: 3 + (i % 3), delay: 0.2 + (i * 0.15), ease: 'easeOut' }}
                className={`absolute w-3 h-3 rounded-full ${
                  ['bg-emerald-400', 'bg-amber-400', 'bg-blue-400', 'bg-rose-400', 'bg-purple-400', 'bg-cyan-400'][i % 6]
                }`}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-sm w-full text-center space-y-6 relative"
          >
            {/* Success icon */}
            <div className="relative w-28 h-28 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-200/40"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 150, delay: 0.15 }}
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/25"
              >
                <CheckCircle2 className="w-14 h-14 text-white" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                className="absolute -top-1 -right-1 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <PartyPopper className="w-5 h-5 text-white" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {farewellMessage || '¡Nos encantó tenerte!'}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-[15px] leading-relaxed">
                Esperamos que hayas disfrutado en<br />
                <strong className="text-neutral-700 dark:text-neutral-300">{tenant.name}</strong>
              </p>
            </motion.div>

            {paidTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-lg shadow-neutral-900/5 dark:shadow-none border border-neutral-100 dark:border-neutral-800"
              >
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide font-medium mb-1">Total pagado</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatPrice(paidTotal, currency)}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-500 text-sm"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Mesa {tableNumber} · ¡Hasta pronto!</span>
            </motion.div>

            {/* Subtle scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="pt-4"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center text-neutral-300 dark:text-neutral-600"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ===== BELOW THE FOLD — discoverable by scrolling ===== */}
        <div className="max-w-sm mx-auto px-6 pb-12 space-y-5">

          {/* Email capture — regalo */}
          {showEmailCapture && (
            <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-rose-200/40 dark:border-rose-800/20 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-4xl">🎁</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {farewellIncentive || 'Compartinos tu email, tenemos un regalo para vos'}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Recibí beneficios exclusivos de {tenant.name}
                </p>
              </div>

              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-2 py-3"
                >
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">¡Listo! Revisá tu email, tu regalo te está esperando.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={comensalName}
                    onChange={(e) => setComensalName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-rose-200/60 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  />
                  <input
                    type="email"
                    value={comensalEmail}
                    onChange={(e) => setComensalEmail(e.target.value)}
                    placeholder="tucorreo@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-rose-200/60 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  />
                  <button
                    onClick={handleEmailSubmit}
                    disabled={sendingEmail || !comensalEmail.trim() || !comensalEmail.includes('@')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
                  >
                    {sendingEmail ? 'Enviando...' : '🎁 Quiero mi regalo'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Review section */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">¿Cómo fue tu experiencia?</h3>
            </div>

            {reviewSent ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">¡Gracias por tu opinión!</span>
              </div>
            ) : (
              <>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Contanos qué te pareció..."
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  rows={3}
                  maxLength={2000}
                />
                {reviewText.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleReviewSubmit}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                  >
                    Enviar opinión
                  </motion.button>
                )}
              </>
            )}
          </div>

          {/* Social follow */}
          {tenantInstagram && (
            <a
              href={`https://instagram.com/${tenantInstagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Seguinos en Instagram</p>
                <p className="text-xs text-neutral-400">@{tenantInstagram.replace('@', '')}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ===== BILL VIEW =====
  if (showBill && (store.status === 'BILL_REQUESTED' || store.status === 'PAYMENT_ENABLED' || store.status === 'WAITING_PAYMENT')) {
    const tipAmount = tipType === 'percentage' ? sessionTotal * (tipValue / 100) : tipType === 'fixed' ? tipValue : 0;
    const grandTotal = sessionTotal + tipAmount;
    const paymentEnabled = store.status === 'PAYMENT_ENABLED' || store.status === 'WAITING_PAYMENT' || billData?.paymentEnabled;
    const tenantInstagram = (tenant as any).instagram;
    const tenantFacebook = (tenant as any).facebook;
    const tenantPhone = (tenant as any).phone;

    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 safe-top">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowBill(false)}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <h1 className="text-[15px] font-semibold text-neutral-900 dark:text-white">Tu cuenta</h1>
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1.5">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Mesa {tableNumber}</span>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-4 space-y-5 pb-10">
          {/* Thank you banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-5 text-center border border-amber-100/60 dark:border-amber-800/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
              className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3"
            >
              <Heart className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              ¡Nos encantó tenerte!
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
              Esperamos que hayas disfrutado tu experiencia en <strong className="text-neutral-800 dark:text-neutral-200">{tenant.name}</strong>
            </p>
          </motion.div>

          {/* Order items with prices */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-800/80 rounded-2xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-700/50"
          >
            <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-700/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">Detalle de consumo</span>
              </div>
            </div>
            <div className="divide-y divide-neutral-50 dark:divide-neutral-700/30">
              {store.orders.map((order) => (
                <div key={order.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Pedido #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="space-y-2.5">
                    {(order.items as any[]).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-300">
                          <span className="text-neutral-400 dark:text-neutral-500 font-medium">{item.quantity}×</span> {item.name}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white tabular-nums">
                          {formatPrice(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-800 flex justify-between text-[15px] font-bold">
              <span className="text-neutral-900 dark:text-white">Subtotal</span>
              <span className="text-neutral-900 dark:text-white tabular-nums">{formatPrice(sessionTotal, currency)}</span>
            </div>
          </motion.div>

          {/* Waiting for payment authorization */}
          {store.status === 'BILL_REQUESTED' && !paymentEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 flex items-start gap-4 border border-amber-100 dark:border-amber-800/30"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-300 dark:border-amber-600"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Cuenta solicitada</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  Un mozo se acercará a tu mesa para habilitar el pago. Mientras tanto, podés seguir pidiendo.
                </p>
              </div>
            </motion.div>
          )}

          {/* Tip + Payment */}
          {paymentEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              {/* Tip selector */}
              <div className="bg-white dark:bg-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-sm border border-neutral-100 dark:border-neutral-700/50">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">¿Querés dejar propina?</h3>
                <div className="grid grid-cols-4 gap-2">
                  {tipOptions.map((pct: number) => (
                    <button
                      key={pct}
                      onClick={() => { setTipType('percentage'); setTipValue(pct); }}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        tipType === 'percentage' && tipValue === pct
                          ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                          : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    onClick={() => { setTipType('none'); setTipValue(0); }}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      tipType === 'none'
                        ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
                    }`}
                  >
                    Sin
                  </button>
                </div>
                {tipType !== 'none' && (
                  <div className="flex justify-between text-sm pt-2 border-t border-neutral-100 dark:border-neutral-700">
                    <span className="text-neutral-500 dark:text-neutral-400">Propina ({tipValue}%)</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(tipAmount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl p-5 flex justify-between items-center shadow-lg">
                <span className="text-[15px] font-medium">Total a pagar</span>
                <span className="text-2xl font-bold tabular-nums">{formatPrice(grandTotal, currency)}</span>
              </div>

              {/* Payment methods */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white px-1">¿Cómo querés pagar?</h3>
                {([
                  {
                    method: 'cash' as const,
                    label: 'Efectivo',
                    desc: 'Pagás en la caja del local',
                    icon: Banknote,
                    accent: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    method: 'mercadopago' as const,
                    label: 'Mercado Pago',
                    desc: 'Dinero, tarjetas, cuotas — todo desde tu cuenta',
                    icon: Smartphone,
                    accent: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
                  },
                  {
                    method: 'card' as const,
                    label: 'Tarjetas',
                    desc: 'Débito o crédito con el posnet del local',
                    icon: CreditCard,
                    accent: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
                  },
                ]).map(({ method, label, desc, icon: Icon, accent }) => (
                  <button
                    key={method}
                    onClick={() => !paying && handlePay(method)}
                    disabled={paying}
                    className="w-full bg-white dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 p-4 flex items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-600 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white text-[15px]">{label}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                  </button>
                ))}
              </div>

              {paying && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Procesando...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Review / feedback section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-sm border border-neutral-100 dark:border-neutral-700/50"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">¿Cómo estuvo tu experiencia?</h3>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Contanos qué te pareció la comida, el servicio, o dejanos una sugerencia..."
              rows={3}
              className="w-full bg-neutral-50 dark:bg-neutral-900 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 resize-none border border-neutral-100 dark:border-neutral-700"
            />
            {reviewSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 py-3 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">¡Gracias por tu opinión!</span>
              </motion.div>
            ) : reviewText.trim() ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={async () => {
                  if (!store.sessionId || !reviewText.trim()) return;
                  try {
                    await fetch(`${API_URL}/api/gastro/session/${store.sessionId}/review`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ review: reviewText.trim() }),
                    });
                    setReviewText('');
                    setReviewSent(true);
                    haptic();
                  } catch {}
                }}
                className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Enviar opinión
              </motion.button>
            ) : null}
          </motion.div>

          {/* Social links */}
          {(tenantInstagram || tenantFacebook || tenantPhone) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-neutral-800/80 rounded-2xl p-5 space-y-3 shadow-sm border border-neutral-100 dark:border-neutral-700/50"
            >
              <p className="text-sm font-semibold text-neutral-900 dark:text-white text-center">Seguinos en redes</p>
              <div className="flex items-center justify-center gap-3">
                {tenantInstagram && (
                  <a
                    href={`https://instagram.com/${tenantInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold active:scale-95 transition-transform shadow-md"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {tenantFacebook && (
                  <a
                    href={tenantFacebook.startsWith('http') ? tenantFacebook : `https://facebook.com/${tenantFacebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold active:scale-95 transition-transform shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Facebook
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Footer message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-500 text-sm pt-2"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Gracias por visitarnos</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== MAIN MENU =====
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* Hero */}
      <div className="relative h-[45vh] min-h-[280px] max-h-[400px] overflow-hidden">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={tenant.name}
              fill
              className={`object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              priority
              onLoad={() => setHeroLoaded(true)}
            />
            {!heroLoaded && (
              <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {tenant.logo && (
                    <Image
                      src={tenant.logo}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-xl border-2 border-white/30"
                    />
                  )}
                  <span className="text-white/60 text-xs font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    Mesa {tableNumber}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{tenant.name}</h1>
                {tenant.description && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-1">{tenant.description}</p>
                )}
              </div>
              {hasOrders && (
                <div className="text-right">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider font-medium">Cuenta</p>
                  <p className="text-white font-bold text-lg tabular-nums">{formatPrice(sessionTotal, currency)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session word card */}
      {sessionWord && (
        <div className="max-w-lg mx-auto px-4 -mt-5 relative z-10 mb-3">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-amber-200/60 dark:border-amber-700/30 shadow-lg shadow-amber-500/8 p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <span className="text-xl">🔑</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Palabra clave de mesa</p>
              <p className="text-2xl font-black tracking-wide text-neutral-900 dark:text-white leading-none">{sessionWord}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 leading-snug">Compartila con tu mesa para que se unan y puedan pedir</p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky category bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 safe-top">
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-3">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"
          >
            <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>

          {/* Category ticker — auto-scrolls left continuously, tap to jump.
              Only taxonomic categories (food types) — promotional/editorial ones
              are excluded to keep navigation clean and objective. */}
          <CategoryTicker
            ref={categoryScrollRef}
            categories={categories}
            groupedProducts={taxonomicGroups}
            activeCategory={activeCategory}
            onSelect={scrollToCategory}
          />

          {/* Orders indicator */}
          {hasOrders && (
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="relative w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"
            >
              <Receipt className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                {store.orders.length}
              </span>
            </button>
          )}
        </div>

        {/* Search input - expandable */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-w-lg mx-auto px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar platos, ingredientes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-neutral-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders panel */}
      <AnimatePresence>
        {showOrders && hasOrders && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800"
          >
            <div className="max-w-lg mx-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Tus pedidos</h3>
                <button onClick={() => setShowOrders(false)} className="text-xs text-neutral-500 font-medium">
                  Cerrar
                </button>
              </div>
              {store.orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-neutral-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Pedido #{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  {(order.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-neutral-500">
                        <span className="text-neutral-400">{item.quantity}×</span> {item.name}
                      </span>
                      <span className="font-medium text-neutral-700 tabular-nums">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Request bill button — only after all orders are delivered */}
              {store.status === 'ORDERING' && allDelivered && (
                <button
                  onClick={handleRequestBill}
                  disabled={requestingBill}
                  className="w-full py-3 rounded-xl border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {requestingBill ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  Pedir la cuenta
                </button>
              )}
              {store.status === 'ORDERING' && !allDelivered && store.orders.length > 0 && (
                <div className="text-center py-3 text-neutral-400 dark:text-neutral-500 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Esperando que te traigan tu pedido...
                </div>
              )}
              {(store.status === 'BILL_REQUESTED' || store.status === 'PAYMENT_ENABLED') && (
                <button
                  onClick={() => { loadBill(); setShowBill(true); setShowOrders(false); }}
                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold active:scale-[0.98] transition-all"
                >
                  Ver cuenta
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu content */}
      <div className="max-w-lg mx-auto">
        {/* Category discovery — horizontal carousel, 2x2 grid per page, swipe to discover.
            Only taxonomic categories — promotional ones are excluded from navigation
            and surface at the top of the scrollable menu instead. */}
        {!search && taxonomicGroups.length > 1 && (
          <div className="pt-6 pb-2">
            <div className="flex items-center gap-2 mb-3 px-4">
              <UtensilsCrossed className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[15px] font-bold text-neutral-900 dark:text-white">Nuestra carta</h2>
            </div>
            <div className="relative">
              {/* Horizontal scroll — each "page" is a 2x2 grid */}
              <div className="flex overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory gap-3 pb-2">
                {Array.from({ length: Math.ceil(taxonomicGroups.length / 4) }).map((_, pageIdx) => {
                  const pageItems = taxonomicGroups.slice(pageIdx * 4, pageIdx * 4 + 4);
                  return (
                    <div key={pageIdx} className="shrink-0 w-[calc(100%-8px)] snap-center grid grid-cols-2 gap-2.5">
                      {pageItems.map((group) => {
                        const theme = getCategoryTheme(group.name);
                        return (
                          <button
                            key={group.id}
                            onClick={() => scrollToCategory(group.id)}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-4 ${theme.bg} border border-neutral-100/60 dark:border-neutral-800/40 active:scale-[0.97] transition-transform text-left`}
                          >
                            <span className={theme.accent}>{theme.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[13px] font-bold truncate ${theme.accent}`}>{group.name}</p>
                              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{group.products.length} platos</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {/* Persistent swipe CTA — always visible when more than 4 categories */}
              {taxonomicGroups.length > 4 && (
                <div className="absolute right-0 top-0 bottom-2 w-12 flex items-center justify-center pointer-events-none bg-gradient-to-l from-white dark:from-neutral-950 via-white/80 dark:via-neutral-950/80 to-transparent">
                  <motion.div
                    className="flex flex-col items-center gap-1"
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-900 dark:text-white" />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured section */}
        {!search && featuredProducts.length >= 2 && (
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Destacados</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <FeaturedCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onTap={() => { setSelectedProduct(product); setDetailQty(1); }}
                  onAdd={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Menu sections — promotional first (editorial styling), then taxonomic.
            Each section is collapsible: tap header to fold/unfold, chevron rotates.
            Defaults to open so default browsing is unchanged; collapse is an opt-in
            to reduce scroll distance on long menus. */}
        {orderedGroups.map((group, groupIdx) => {
          const isPromo = isPromotionalCategory(group.name);
          const theme = isPromo ? PROMOTIONAL_THEME : getCategoryTheme(group.name);
          const isCollapsed = collapsedSections.has(group.id);
          return (
          <div
            key={group.id}
            id={`section-${group.id}`}
            ref={(el) => { if (el) sectionRefs.current.set(group.id, el); }}
            className="pt-8"
          >
            {/* Premium section header — whole row is the tap target */}
            <div className="px-4 mb-4">
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                aria-expanded={!isCollapsed}
                aria-controls={`section-body-${group.id}`}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 ${theme.bg} border ${isPromo ? 'border-amber-200/60 dark:border-amber-900/40' : 'border-neutral-100/60 dark:border-neutral-800/40'} active:scale-[0.99] transition-transform text-left`}
              >
                <span className={theme.accent}>{theme.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-[17px] font-bold tracking-tight ${theme.accent} truncate`}>{group.name}</h2>
                    {isPromo && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Destacado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {group.products.length} {group.products.length === 1 ? 'plato' : 'platos'}
                    {isCollapsed && ' · tocá para ver'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  />
                </div>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  id={`section-body-${group.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {group.products.map((product: any) => (
                      <MenuItemRow
                        key={product.id}
                        product={product}
                        currency={currency}
                        quantity={store.currentItems.find(i => i.productId === product.id)?.quantity || 0}
                        onTap={() => { setSelectedProduct(product); setDetailQty(1); }}
                        onAdd={() => addToCart(product)}
                        onIncrement={() => {
                          store.addCurrentItem({ productId: product.id, name: product.name, price: Number(product.price) });
                          haptic();
                        }}
                        onDecrement={() => {
                          const current = store.currentItems.find(i => i.productId === product.id);
                          if (current) store.updateCurrentItemQuantity(product.id, current.quantity - 1);
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          );
        })}

        {/* Empty search state */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <Search className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
            <p className="text-sm text-neutral-500">No encontramos platos con &quot;{search}&quot;</p>
          </div>
        )}

        {/* Bottom spacing for cart bar */}
        <div className="h-32" />
      </div>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full bg-neutral-900 dark:bg-white shadow-lg shadow-neutral-900/20 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowUp className="w-5 h-5 text-white dark:text-neutral-900" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating cart bar */}
      <AnimatePresence>
        {currentCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <motion.button
              onClick={() => setShowCart(true)}
              animate={cartPulse ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg mx-auto bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl shadow-black/20 dark:shadow-white/10 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center">
                  <span className="text-sm font-bold">{currentCount}</span>
                </div>
                <span className="font-semibold text-[15px]">Ver pedido</span>
              </div>
              <span className="font-semibold text-[15px] tabular-nums">{formatPrice(currentTotal, currency)}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request bill floating button — only after all orders delivered */}
      <AnimatePresence>
        {hasOrders && currentCount === 0 && store.status === 'ORDERING' && !orderSuccess && allDelivered && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="max-w-lg mx-auto flex gap-2">
              <button
                onClick={() => setShowOrders(true)}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-2xl px-5 py-4 flex items-center gap-2 shadow-lg shadow-black/5"
              >
                <Receipt className="w-4 h-4" />
                <span className="text-sm font-semibold">{store.orders.length}</span>
              </button>
              <button
                onClick={handleRequestBill}
                disabled={requestingBill}
                className="flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl px-5 py-4 flex items-center justify-center gap-2 shadow-xl shadow-black/20 dark:shadow-white/10 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {requestingBill ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span className="font-semibold text-[15px]">Pedir la cuenta · {formatPrice(sessionTotal, currency)}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Orders in progress" floating bar — shows right after sending when pedir cuenta isn't available yet */}
      <AnimatePresence>
        {hasOrders && currentCount === 0 && store.status === 'ORDERING' && !orderSuccess && !allDelivered && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <button
              onClick={() => setShowPreparingOverlay(true)}
              className="w-full max-w-lg mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">Preparando tu pedido</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{store.orders.length} {store.orders.length === 1 ? 'pedido' : 'pedidos'} · {formatPrice(sessionTotal, currency)}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PREPARING OVERLAY — tapped from floating bar ===== */}
      <AnimatePresence>
        {showPreparingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex flex-col"
          >
            {/* Close */}
            <div className="flex justify-end p-4 safe-top">
              <button
                onClick={() => setShowPreparingOverlay(false)}
                className="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-sm mx-auto px-6 pb-10 space-y-8">
                {/* Animated chef icon */}
                <div className="flex flex-col items-center pt-4">
                  <div className="relative w-28 h-28">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-amber-200/40"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25"
                    >
                      <ChefHat className="w-14 h-14 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-2 -right-1 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Flame className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-6"
                  >
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Estamos cocinando</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-[15px]">
                      Tu pedido está siendo preparado con todo el cariño
                    </p>
                  </motion.div>
                </div>

                {/* Order items — NO prices */}
                {store.orders.map((order, orderIdx) => {
                  const s = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + orderIdx * 0.1 }}
                      className="bg-white dark:bg-neutral-800/80 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-lg">
                          Pedido #{order.orderNumber}
                        </span>
                        <div className={`flex items-center gap-2 text-xs font-semibold ${s.color}`}>
                          <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                            {s.pulse && <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${s.dot} animate-ping opacity-75`} />}
                          </div>
                          {s.label}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(order.items as any[]).map((item: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + orderIdx * 0.1 + i * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{item.quantity}</span>
                            </div>
                            <span className="text-[15px] text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress bar for PREPARING */}
                      {order.status === 'PREPARING' && (
                        <div className="pt-2">
                          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                              animate={{ width: ['20%', '80%', '40%', '70%', '50%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Waiting message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center gap-3 pt-2"
                >
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 rounded-full">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <UtensilsCrossed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">En la cocina</span>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-amber-500"
                    >
                      ...
                    </motion.span>
                  </div>
                  <p className="text-[12px] text-neutral-400 dark:text-neutral-500">Mesa {tableNumber} · {tenant.name}</p>
                </motion.div>

                {/* Keep browsing */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowPreparingOverlay(false)}
                  className="w-full py-3.5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Seguir viendo la carta
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELIVERED OVERLAY — full screen, same style as preparing ===== */}
      <AnimatePresence>
        {showDeliveredOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[60] flex flex-col ${
              deliveredOverlayPartial
                ? 'bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950'
                : 'bg-gradient-to-b from-emerald-50 via-white to-green-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950'
            }`}
          >
            {/* Close */}
            <div className="flex justify-end p-4 safe-top">
              <button
                onClick={() => { setShowDeliveredOverlay(false); setDeliveredOverlayPartial(false); }}
                className="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-sm mx-auto px-6 pb-10 space-y-8">
                {/* Animated icon */}
                <div className="flex flex-col items-center pt-4">
                  <div className="relative w-28 h-28">
                    <motion.div
                      className={`absolute inset-0 rounded-full ${deliveredOverlayPartial ? 'bg-amber-200/40' : 'bg-emerald-200/40'}`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl ${
                        deliveredOverlayPartial
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25'
                          : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/25'
                      }`}
                    >
                      {deliveredOverlayPartial ? (
                        <UtensilsCrossed className="w-14 h-14 text-white" />
                      ) : (
                        <PartyPopper className="w-14 h-14 text-white" />
                      )}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-6"
                  >
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {deliveredOverlayPartial ? '¡Buen provecho!' : '¡Todo listo!'}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-[15px]">
                      {deliveredOverlayPartial
                        ? 'Tu pedido acaba de llegar a la mesa'
                        : 'Todos tus pedidos fueron entregados'}
                    </p>
                  </motion.div>
                </div>

                {/* Order items — NO prices */}
                {store.orders.map((order, orderIdx) => {
                  const s = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + orderIdx * 0.1 }}
                      className="bg-white dark:bg-neutral-800/80 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-lg">
                          Pedido #{order.orderNumber}
                        </span>
                        <div className={`flex items-center gap-2 text-xs font-semibold ${s.color}`}>
                          <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                            {s.pulse && <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${s.dot} animate-ping opacity-75`} />}
                          </div>
                          {s.label}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {(order.items as any[]).map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              deliveredOverlayPartial
                                ? 'bg-amber-50 dark:bg-amber-950/30'
                                : 'bg-emerald-50 dark:bg-emerald-950/30'
                            }`}>
                              <span className={`text-sm font-bold ${
                                deliveredOverlayPartial
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}>{item.quantity}</span>
                            </div>
                            <span className="text-[15px] text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => { setShowDeliveredOverlay(false); setDeliveredOverlayPartial(false); }}
                    className="w-full py-3.5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    {deliveredOverlayPartial ? 'Seguir viendo la carta' : 'Volver a la carta'}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-500 text-sm"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mesa {tableNumber} · {tenant.name}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PRODUCT DETAIL BOTTOM SHEET ===== */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailSheet
            product={selectedProduct}
            currency={currency}
            qty={detailQty}
            onChangeQty={setDetailQty}
            onAdd={() => {
              addToCart(selectedProduct, detailQty);
              setSelectedProduct(null);
              setDetailQty(1);
            }}
            onClose={() => { setSelectedProduct(null); setDetailQty(1); }}
          />
        )}
      </AnimatePresence>

      {/* ===== CART BOTTOM SHEET ===== */}
      <AnimatePresence>
        {showCart && (
          <CartSheet
            items={store.currentItems}
            currency={currency}
            sending={sending}
            onUpdateQty={(productId, qty) => store.updateCurrentItemQuantity(productId, qty)}
            onRemove={(productId) => store.removeCurrentItem(productId)}
            onSend={handleSendOrder}
            onClose={() => setShowCart(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== ORDER SUCCESS OVERLAY ===== */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="max-w-xs w-full text-center space-y-6"
            >
              {/* Animated checkmark */}
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-200/40 dark:bg-emerald-800/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 0.5, 0.3] }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-200/30 dark:bg-emerald-800/15"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.8, 1.2], opacity: [0, 0.3, 0.15] }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                />
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20"
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">¡Pedido enviado!</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-[15px]">
                  Pedido #{orderSuccess.orderNumber} · {orderSuccess.itemCount} {orderSuccess.itemCount === 1 ? 'item' : 'items'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 rounded-2xl"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Lo estamos preparando</span>
              </motion.div>

              {/* Auto-dismiss progress bar */}
              <motion.div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setOrderSuccess(null)}
                className="text-sm text-neutral-400 dark:text-neutral-500 font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Seguir viendo la carta
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 inset-x-4 z-50 max-w-lg mx-auto"
          >
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        <Sun className={`w-4.5 h-4.5 absolute text-amber-500 transition-all duration-300 ${theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
        <Moon className={`w-4.5 h-4.5 absolute text-blue-400 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
      </button>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] || { label: status, color: 'text-neutral-500', dot: 'bg-neutral-400' };
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${s.color}`}>
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
        {s.pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${s.dot} animate-ping opacity-75`} />
        )}
      </div>
      {s.label}
    </div>
  );
}

function FeaturedCard({ product, currency, onTap, onAdd }: {
  product: any; currency: string; onTap: () => void; onAdd: () => void;
}) {
  const img = product.images?.[0]?.url;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
    >
      <button onClick={onTap} className="w-full text-left">
        <div className="relative aspect-[4/3]">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-neutral-300" />
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Popular
            </div>
          )}
        </div>
      </button>
      <div className="p-3">
        <button onClick={onTap} className="text-left w-full">
          <h3 className="font-medium text-sm text-neutral-900 dark:text-white leading-tight line-clamp-1">{product.name}</h3>
        </button>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatPrice(product.price, currency)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MenuItemRow({ product, currency, quantity, onTap, onAdd, onIncrement, onDecrement }: {
  product: any; currency: string; quantity: number;
  onTap: () => void; onAdd: () => void; onIncrement: () => void; onDecrement: () => void;
}) {
  const img = product.images?.[0]?.url;
  const attrs = product.attributes || [];
  const tags: string[] = [];
  for (const a of attrs) {
    if (a.value && typeof a.value === 'string') tags.push(a.value);
  }

  return (
    <div className="flex gap-4 px-4 py-4">
      <button onClick={onTap} className="flex-1 min-w-0 text-left">
        <h3 className="font-medium text-[15px] text-neutral-900 dark:text-white leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatPrice(product.price, currency)}</span>
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <span className="text-xs text-neutral-400 line-through">{formatPrice(product.compareAtPrice, currency)}</span>
          )}
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </button>

      <div className="flex flex-col items-center gap-2 shrink-0">
        {img ? (
          <button onClick={onTap} className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <Image src={img} alt="" fill className="object-cover" />
          </button>
        ) : (
          <div className="w-24 h-24" />
        )}
        {quantity === 0 ? (
          <button
            onClick={onAdd}
            className="w-24 py-1.5 rounded-lg border-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white text-xs font-semibold active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-neutral-900 dark:bg-white rounded-lg px-1 py-0.5">
            <button onClick={onDecrement} className="w-7 h-7 rounded-md flex items-center justify-center text-white dark:text-neutral-900 active:bg-white/20 dark:active:bg-black/10">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={quantity}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="text-sm font-bold text-white dark:text-neutral-900 w-4 text-center"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
            <button onClick={onIncrement} className="w-7 h-7 rounded-md flex items-center justify-center text-white dark:text-neutral-900 active:bg-white/20 dark:active:bg-black/10">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailSheet({ product, currency, qty, onChangeQty, onAdd, onClose }: {
  product: any; currency: string; qty: number;
  onChangeQty: (q: number) => void; onAdd: () => void; onClose: () => void;
}) {
  const images = (product.images || []).sort((a: any, b: any) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.order || 0) - (b.order || 0);
  });
  const [currentImg, setCurrentImg] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());
  const fichaObserverRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const touchStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const attrs = product.attributes || [];
  const total = Number(product.price) * qty;
  const galleryRef = useRef<HTMLDivElement>(null);

  // Swipe-to-dismiss: only when scrolled to top
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    touchStartRef.current = { y: e.touches[0].clientY, scrollTop: scrollEl.scrollTop };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    if (touchStartRef.current.scrollTop <= 0 && deltaY > 0) {
      e.preventDefault();
      setIsDragging(true);
      setDragY(Math.max(0, deltaY * 0.6));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (isDragging && dragY > 120) {
      onClose();
    }
    setDragY(0);
    setIsDragging(false);
    touchStartRef.current = null;
  }, [isDragging, dragY, onClose]);

  // Parse attributes
  const getAttr = (key: string) => attrs.find((a: any) => a.key === key && a.value)?.value;
  const ingredientes = getAttr('ingredientes');
  const elaboracion = getAttr('elaboracion');
  const origen = getAttr('origen');
  const maridaje = getAttr('maridaje');
  const calorias = getAttr('calorias');
  const alergenos = getAttr('alergenos');
  const seccion = getAttr('seccion');
  const porciones = getAttr('porciones');
  const aptoVegano = getAttr('apto_vegano');
  const aptoCeliaco = getAttr('apto_celiaco');
  const hasFicha = ingredientes || elaboracion || origen || maridaje;

  // Ficha sections config (needed before useEffect)
  const fichaConfig: { key: string; icon: React.ReactNode; label: string; accentClass: string; value: string | undefined }[] = [
    { key: 'ingredientes', icon: <UtensilsCrossed className="w-4 h-4" />, label: 'Ingredientes', accentClass: 'text-amber-600 dark:text-amber-400', value: ingredientes },
    { key: 'elaboracion', icon: <ChefHat className="w-4 h-4" />, label: 'Elaboracion', accentClass: 'text-orange-600 dark:text-orange-400', value: elaboracion },
    { key: 'origen', icon: <BookOpen className="w-4 h-4" />, label: 'Origen e Historia', accentClass: 'text-rose-600 dark:text-rose-400', value: origen },
    { key: 'maridaje', icon: <Wine className="w-4 h-4" />, label: 'Maridaje sugerido', accentClass: 'text-purple-600 dark:text-purple-400', value: maridaje },
  ].filter(f => f.value);

  // Gallery scroll handler
  const handleGalleryScroll = useCallback(() => {
    const el = galleryRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentImg(idx);
  }, []);

  // Ficha reveal: first section auto-reveals after modal opens (invites discovery),
  // remaining sections reveal one-by-one as user scrolls to them
  const revealedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setRevealedSections(new Set());
    revealedKeysRef.current = new Set();
    if (!hasFicha) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const keys = fichaConfig.map(f => f.key);

    // Auto-reveal first section after 800ms to invite the user to scroll
    const firstTimer = setTimeout(() => {
      if (keys.length > 0) {
        revealedKeysRef.current.add(keys[0]);
        setRevealedSections(new Set(revealedKeysRef.current));
      }
    }, 800);

    // Remaining sections: scroll-driven, one at a time
    const handleScroll = () => {
      if (keys.length <= 1) return;
      const containerRect = scrollEl.getBoundingClientRect();
      const triggerLine = containerRect.top + containerRect.height * 0.8;

      let changed = false;
      for (let i = 1; i < keys.length; i++) {
        const key = keys[i];
        if (revealedKeysRef.current.has(key)) continue;
        // Only reveal next unrevealed — one at a time
        const el = fichaObserverRefs.current.get(key);
        if (!el) break;
        const elRect = el.getBoundingClientRect();
        if (elRect.top < triggerLine) {
          revealedKeysRef.current.add(key);
          changed = true;
        }
        break; // only check the next unrevealed one
      }

      if (changed) {
        setRevealedSections(new Set(revealedKeysRef.current));
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(firstTimer);
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build dietary/info badges
  const badges: { icon: React.ReactNode; label: string; variant: string }[] = [];
  if (aptoVegano === 'Vegano') badges.push({ icon: <Leaf className="w-3 h-3" />, label: 'Vegano', variant: 'green' });
  else if (aptoVegano === 'Vegetariano') badges.push({ icon: <Leaf className="w-3 h-3" />, label: 'Vegetariano', variant: 'green' });
  if (aptoCeliaco === 'true') badges.push({ icon: <Wheat className="w-3 h-3" />, label: 'Sin TACC', variant: 'amber' });
  if (porciones) badges.push({ icon: <UtensilsCrossed className="w-3 h-3" />, label: porciones, variant: 'neutral' });
  if (calorias) badges.push({ icon: <Flame className="w-3 h-3" />, label: calorias, variant: 'neutral' });

  const badgeColors: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    neutral: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border-neutral-200/60 dark:border-neutral-800',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: dragY }}
        exit={{ y: '100%' }}
        transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col"
        style={{ touchAction: 'none', opacity: isDragging ? Math.max(0.3, 1 - dragY / 400) : 1, borderRadius: isDragging ? `${Math.min(24, dragY / 5)}px` : 0 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className={`w-10 h-1 rounded-full transition-colors ${isDragging ? 'bg-neutral-400' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
        </div>

        <div ref={scrollRef} className="overflow-y-auto flex-1 pb-32" style={{ overscrollBehavior: 'none', touchAction: isDragging ? 'none' : 'pan-y' }}>

          {/* ===== IMAGE GALLERY ===== */}
          {images.length > 0 ? (
            <div className="relative w-full bg-neutral-100 dark:bg-neutral-900">
              {/* Blurred ambient bg */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={images[currentImg]?.url || images[0]?.url}
                  alt=""
                  fill
                  className="object-cover blur-3xl scale-150 opacity-20 dark:opacity-15 pointer-events-none"
                />
              </div>

              {/* Swipeable gallery */}
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {images.map((img: any, i: number) => (
                  <div key={img.id || i} className="relative w-full aspect-[4/3] shrink-0 snap-center">
                    <Image
                      src={img.url}
                      alt={img.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform z-10"
              >
                <X className="w-4.5 h-4.5 text-white" />
              </button>

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_: any, i: number) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentImg ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Featured badge */}
              {product.isFeatured && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg z-10">
                  <Sparkles className="w-3 h-3" />
                  Destacado
                </div>
              )}
            </div>
          ) : (
            <div className="relative pt-4 px-4 flex justify-end">
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <X className="w-4.5 h-4.5 text-neutral-500" />
              </button>
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="px-5 -mt-1 relative z-10">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id || i}
                    onClick={() => {
                      setCurrentImg(i);
                      galleryRef.current?.scrollTo({ left: i * (galleryRef.current?.clientWidth || 0), behavior: 'smooth' });
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-200 border-2 ${
                      i === currentImg
                        ? 'border-neutral-900 dark:border-white shadow-md'
                        : 'border-transparent opacity-50'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== MAIN CONTENT ===== */}
          <div className="px-5 pt-3">

            {/* Category label */}
            {seccion && (
              <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">{seccion}</span>
            )}

            {/* Product name — hero typography */}
            <h2 className="text-[26px] font-extrabold text-neutral-900 dark:text-white leading-[1.15] tracking-tight mt-1">{product.name}</h2>

            {/* Price row */}
            <div className="flex items-baseline gap-3 mt-2.5">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{formatPrice(product.price, currency)}</span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-base text-neutral-400 line-through font-medium">{formatPrice(product.compareAtPrice, currency)}</span>
              )}
            </div>

            {/* Badges row */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map((b, i) => (
                  <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold ${badgeColors[b.variant]}`}>
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
            )}

            {/* ===== DESCRIPTION ===== */}
            {(product.shortDescription || product.description) && (
              <div className="mt-6">
                {product.shortDescription && (
                  <p className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">{product.shortDescription}</p>
                )}
                {product.description && (
                  <p className={`text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed ${product.shortDescription ? 'mt-2' : ''}`}>{product.description}</p>
                )}
              </div>
            )}

            {/* ===== FICHA GASTRONOMICA — Auto-reveal on scroll ===== */}
            {hasFicha && (
              <div className="mt-8">
                {/* Section header with elegant line */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 shrink-0">Sobre este plato</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent" />
                </div>

                <div className="space-y-3">
                  {fichaConfig.map((section, idx) => {
                    const isRevealed = revealedSections.has(section.key);
                    const accentBg = section.key === 'ingredientes' ? 'bg-amber-500' :
                      section.key === 'elaboracion' ? 'bg-orange-500' :
                      section.key === 'origen' ? 'bg-rose-500' : 'bg-purple-500';
                    const accentGlow = section.key === 'ingredientes' ? 'shadow-amber-500/20' :
                      section.key === 'elaboracion' ? 'shadow-orange-500/20' :
                      section.key === 'origen' ? 'shadow-rose-500/20' : 'shadow-purple-500/20';
                    return (
                      <div
                        key={section.key}
                        data-ficha-key={section.key}
                        ref={(el) => { if (el) fichaObserverRefs.current.set(section.key, el); }}
                        className="rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/60"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' }}
                          animate={isRevealed
                            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                            : { opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' }
                          }
                          transition={{
                            duration: 0.7,
                            ease: [0.16, 1, 0.3, 1], // spring-like overshoot
                            filter: { duration: 0.5 },
                            scale: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }, // bounce
                          }}
                        >
                          {/* Header with icon entrance */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            <motion.span
                              className={`${section.accentClass}`}
                              initial={{ rotate: -90, scale: 0 }}
                              animate={isRevealed
                                ? { rotate: 0, scale: 1 }
                                : { rotate: -90, scale: 0 }
                              }
                              transition={{
                                duration: 0.5,
                                delay: isRevealed ? 0.15 : 0,
                                ease: [0.34, 1.56, 0.64, 1], // springy bounce
                              }}
                            >
                              {section.icon}
                            </motion.span>
                            <span className="flex-1 text-[14px] font-semibold text-neutral-800 dark:text-neutral-200">{section.label}</span>
                          </div>

                          {/* Content — slides open with accent line draw + text blur-to-clear */}
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={isRevealed ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.6, delay: isRevealed ? 0.1 : 0, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: 0.4, delay: isRevealed ? 0.2 : 0 },
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0">
                              {/* Accent line draws from left to right */}
                              <motion.div
                                className={`h-0.5 rounded-full mb-3 opacity-60 ${accentBg}`}
                                initial={{ width: 0 }}
                                animate={isRevealed ? { width: 48 } : { width: 0 }}
                                transition={{
                                  duration: 0.8,
                                  delay: isRevealed ? 0.3 : 0,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              />
                              {/* Text blur-to-clear with upward slide */}
                              <motion.p
                                className="text-[14px] leading-[1.7] text-neutral-600 dark:text-neutral-400"
                                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                                animate={isRevealed
                                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                                  : { opacity: 0, y: 12, filter: 'blur(4px)' }
                                }
                                transition={{
                                  duration: 0.6,
                                  delay: isRevealed ? 0.35 : 0,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                {section.value}
                              </motion.p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== ALLERGENS — subtle, low-key ===== */}
            {alergenos && (
              <div className="mt-5 flex items-start gap-2 px-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed text-neutral-400 dark:text-neutral-500">
                  <span className="font-medium">Alérgenos:</span>{' '}
                  {alergenos.split(',').map((a: string) => a.trim()).join(' · ')}
                </p>
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-6" />
          </div>
        </div>

        {/* ===== FIXED BOTTOM CTA ===== */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800">
          <div className="px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => onChangeQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center text-neutral-600 dark:text-neutral-300 active:bg-neutral-200 dark:active:bg-neutral-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={qty}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="text-[15px] font-bold w-7 text-center text-neutral-900 dark:text-white tabular-nums"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
                <button
                  onClick={() => onChangeQty(Math.min(99, qty + 1))}
                  className="w-11 h-11 flex items-center justify-center text-neutral-600 dark:text-neutral-300 active:bg-neutral-200 dark:active:bg-neutral-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <button
                onClick={onAdd}
                className="flex-1 h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-[15px] font-bold active:scale-[0.98] transition-all shadow-lg shadow-neutral-900/10 dark:shadow-none flex items-center justify-center gap-2"
              >
                <span>Agregar</span>
                <span className="opacity-60 font-normal">·</span>
                <span>{formatPrice(total, currency)}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function CartSheet({ items, currency, sending, onUpdateQty, onRemove, onSend, onClose }: {
  items: any[]; currency: string; sending: boolean;
  onUpdateQty: (id: string, qty: number) => void; onRemove: (id: string) => void;
  onSend: () => void; onClose: () => void;
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-900 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        </div>

        <div className="px-5 pb-3 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tu pedido</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-32">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.map((item) => (
              <div key={item.productId} className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[15px] text-neutral-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 tabular-nums">{formatPrice(item.price * item.quantity, currency)}</p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-1 py-0.5">
                  <button
                    onClick={() => item.quantity === 1 ? onRemove(item.productId) : onUpdateQty(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-neutral-700 shadow-sm flex items-center justify-center text-neutral-600 dark:text-neutral-200"
                  >
                    {item.quantity === 1 ? <X className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-neutral-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-neutral-700 shadow-sm flex items-center justify-center text-neutral-600 dark:text-neutral-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed bottom */}
        <div className="absolute bottom-0 inset-x-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onSend}
            disabled={sending || items.length === 0}
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-4 rounded-2xl text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar pedido · {formatPrice(total, currency)}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
