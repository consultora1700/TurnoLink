'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  X,
  Package,
  ChevronRight,
  ChevronLeft,
  Menu,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import type { TenantPublic, Product, ProductCategory, TenantBranding } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { AnnouncementBar } from './announcement-bar';
import { BackgroundEffectLayer } from './background-effects';

interface StorefrontProps {
  tenant: TenantPublic;
  slug: string;
  products: Product[];
  categories: ProductCategory[];
  branding: TenantBranding | null;
  developments?: any[];
}

export function PublicStorefront({
  tenant,
  slug,
  products,
  categories,
  branding,
  developments: _developments,
}: StorefrontProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);

  // Cart store
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addItem);
  const removeFromCart = useCartStore((s) => s.removeItem);
  const updateCartQty = useCartStore((s) => s.updateQuantity);
  const cartCount = useCartStore((s) => s.getCount());
  const cartTotal = useCartStore((s) => s.getTotal());

  useEffect(() => { setCartMounted(true); }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  // Close cart on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Settings from branding ──────────────────────────────
  const colors = {
    primary: tenant.settings.primaryColor || branding?.primaryColor || '#F59E0B',
    secondary: tenant.settings.secondaryColor || branding?.secondaryColor || '#8B5CF6',
    accent: tenant.settings.accentColor || branding?.accentColor || '#F59E0B',
    bg: branding?.backgroundColor || '#FFFFFF',
    text: branding?.textColor || '#1F2937',
  };

  // Helper: detect if a hex color is dark
  const isDark = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };

  const darkBg = isDark(colors.bg);

  // Lighten/darken the background for card surfaces
  const shiftColor = (hex: string, amount: number): string => {
    const c = hex.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(c.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(c.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(c.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Card surface colors — adapt to dark/light backgrounds
  const makeCardColors = (bgHex: string, dark: boolean) => ({
    surface: dark ? shiftColor(bgHex, 12) : '#ffffff',
    surfaceElevated: dark ? shiftColor(bgHex, 22) : '#ffffff',
    text: dark ? '#f1f5f9' : colors.text,
    muted: dark ? '#94a3b8' : '#64748b',
    border: dark ? shiftColor(bgHex, 35) : '#f1f5f9',
    hoverBorder: dark ? shiftColor(bgHex, 55) : '#e2e8f0',
    placeholder: dark ? shiftColor(bgHex, 18) : '#f1f5f9',
    shadow: dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.04)',
    shadowHover: dark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.08)',
  });
  const cardColors = makeCardColors(colors.bg, darkBg);

  const showPrices = branding?.showPrices ?? tenant.settings.showPrices ?? true;
  const showStock = branding?.showStock ?? false;
  const heroStyle = branding?.storeHeroStyle || 'classic';
  const cardStyle = branding?.storeCardStyle || 'standard';
  const profilePhotoStyle = branding?.profilePhotoStyle || 'round';
  const showCategoryFilter = branding?.showCategoryFilter ?? true;
  const showSearchBar = branding?.showSearchBar ?? true;
  const showWhatsappButton = branding?.showWhatsappButton ?? true;
  const announcementEnabled = branding?.announcementEnabled ?? false;
  const announcementText = branding?.announcementText || '';
  const announcementBgColor = branding?.announcementBgColor || '#000000';
  const announcementTextColor = branding?.announcementTextColor || '#FFFFFF';
  const announcementSpeed = (branding?.announcementSpeed as 'slow' | 'normal' | 'fast') || 'normal';

  // New advanced settings
  const buttonStyle = branding?.buttonStyle || 'pill';
  const buttonText = branding?.buttonText || 'Consultar';
  const cardBorderRadius = branding?.cardBorderRadius || 'lg';
  const imageAspectRatio = branding?.imageAspectRatio || 'square';
  const heroHeight = branding?.heroHeight || 'medium';
  const heroOverlay = branding?.heroOverlay || 'gradient';
  const mobileColumns = branding?.mobileColumns ?? 2;
  const priceStyle = branding?.priceStyle || 'default';
  const categoryStyle = branding?.categoryStyle || 'pills';
  const headingFont = branding?.headingFontFamily || undefined;

  // Logo scale & glow & background effects
  const logoScale = branding?.logoScale ?? 1.0;
  const logoOffsetX = branding?.logoOffsetX ?? 0;
  const logoOffsetY = branding?.logoOffsetY ?? 0;
  const logoGlowEnabled = branding?.logoGlowEnabled ?? false;
  const logoGlowColor = branding?.logoGlowColor || colors.primary;
  const logoGlowIntensity = branding?.logoGlowIntensity || 'medium';
  const bgEffect = branding?.backgroundEffect || 'none';
  const bgEffectColor = branding?.backgroundEffectColor || colors.primary;
  const bgEffectOpacity = branding?.backgroundEffectOpacity ?? 0.15;

  // Page gradient — multi-stop interpolation like checkout
  const gradientEnabled = branding?.gradientEnabled ?? false;
  const gradientFrom = branding?.gradientFrom || '#ffffff';
  const gradientTo = branding?.gradientTo || '#111827';
  const gradientStyle = branding?.gradientStyle || 'fade';

  // Card colors for the bottom of the page when gradient is active
  const gradientBottomDark = gradientEnabled && isDark(gradientTo);
  const bottomCardColors = gradientBottomDark
    ? makeCardColors(gradientTo, true)
    : cardColors;

  const buildSmoothGradient = (from: string, to: string): string => {
    const parse = (hex: string) => {
      const c = hex.replace('#', '');
      return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
    };
    const toHex = (r: number, g: number, b: number) =>
      `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    const [r1, g1, b1] = parse(from);
    const [r2, g2, b2] = parse(to);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const stops = [
      [0, 0], [15, 0], [20, 0.05], [26, 0.12], [33, 0.22],
      [40, 0.35], [48, 0.5], [55, 0.62], [62, 0.74], [70, 0.84],
      [78, 0.91], [85, 0.95], [92, 0.98], [100, 1],
    ];
    const css = stops.map(([pct, t]) =>
      `${toHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t))} ${pct}%`
    ).join(', ');
    return `linear-gradient(180deg, ${css})`;
  };

  // ─── Computed Style Maps ───────────────────────────────────
  const BORDER_RADIUS_MAP: Record<string, string> = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
  };
  const cardRadius = BORDER_RADIUS_MAP[cardBorderRadius] || 'rounded-xl';

  const ASPECT_MAP: Record<string, string> = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  };
  const aspectClass = ASPECT_MAP[imageAspectRatio] || 'aspect-square';

  const HERO_HEIGHT_MAP: Record<string, string> = {
    compact: 'h-36 sm:h-44 md:h-52',
    medium: 'h-48 sm:h-60 md:h-72',
    tall: 'h-64 sm:h-80 md:h-[28rem]',
    full: 'h-[70vh] sm:h-[75vh] md:h-[80vh]',
  };
  const heroHeightClass = HERO_HEIGHT_MAP[heroHeight] || HERO_HEIGHT_MAP.medium;

  const OVERLAY_MAP: Record<string, string> = {
    gradient: 'bg-gradient-to-t from-black/50 via-black/20 to-transparent',
    solid: 'bg-black/30',
    blur: 'backdrop-blur-md bg-black/20',
    none: '',
  };
  const overlayClass = OVERLAY_MAP[heroOverlay] || OVERLAY_MAP.gradient;

  const BTN_STYLE_MAP: Record<string, string> = {
    pill: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-md',
    ghost: 'rounded-lg bg-transparent border-2',
  };
  const btnRadius = BTN_STYLE_MAP[buttonStyle] || 'rounded-full';
  const isGhostBtn = buttonStyle === 'ghost';

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.categoryId === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return a.order - b.order;
    });

    return result;
  }, [products, search, activeCategory]);

  // Primary image helper
  const getPrimaryImage = (product: Product): string | null => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find((img) => img.isPrimary);
    return primary?.url || product.images[0]?.url || null;
  };

  // WhatsApp link
  const whatsappNumber = tenant.phone?.replace(/\D/g, '') || '';
  const getWhatsAppLink = (product: Product) => {
    const msg = encodeURIComponent(
      `Hola! Me interesa el producto "${product.name}" (${formatPrice(product.price)}). ¿Está disponible?`
    );
    return `https://wa.me/${whatsappNumber}?text=${msg}`;
  };

  // Add to cart helper
  const handleAddToCart = (product: Product) => {
    const image = getPrimaryImage(product);
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image,
      stock: product.stock,
      trackInventory: product.trackInventory,
    }, slug);
  };

  // storeType from tenant settings controls cart/checkout functionality
  const storeType = tenant.settings?.storeType || 'catalogo';
  const isEcommerce = storeType === 'ecommerce';

  // Categories with count
  const categoriesWithCount = categories.filter((cat) =>
    products.some((p) => p.categoryId === cat.id && p.isActive)
  );

  const logoUrl = branding?.logoUrl || tenant.logo;
  const storeName = branding?.welcomeTitle || tenant.name;
  const storeDesc = branding?.welcomeSubtitle || tenant.description;
  const bannerUrl = branding?.bannerImageUrl || branding?.coverImageUrl || tenant.coverImage;

  // ─── Cart Drawer ─────────────────────────────────────────
  const CartDrawer = () => {
    if (!cartOpen) return null;
    return (
      <>
        <style>{`
          @keyframes ck-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes ck-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes ck-item-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          style={{ animation: 'ck-fade-in 0.2s ease-out' }}
          onClick={() => setCartOpen(false)}
        />
        {/* Panel */}
        <div
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] shadow-2xl z-[60] flex flex-col"
          style={{
            animation: 'ck-drawer-in 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            backgroundColor: darkBg ? cardColors.surface : '#ffffff',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${cardColors.border}` }}>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
              <ShoppingCart className="h-4 w-4" style={{ color: colors.primary }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm" style={{ color: cardColors.text }}>Mi Carrito</h3>
              <p className="text-xs" style={{ color: cardColors.muted }}>{cartMounted ? cartCount : 0} producto{cartCount !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: cardColors.muted }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {(!cartMounted || cartItems.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: darkBg ? cardColors.surfaceElevated : '#f3f4f6' }}>
                  <Package className="h-7 w-7" style={{ color: cardColors.muted }} />
                </div>
                <p className="text-sm font-medium" style={{ color: cardColors.muted }}>Tu carrito está vacío</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-3 text-sm font-medium underline transition-colors"
                  style={{ color: colors.primary }}
                >
                  Ver productos
                </button>
              </div>
            ) : (
              <div>
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-4"
                    style={{
                      animation: `ck-item-in 0.3s ${idx * 0.05}s ease-out both`,
                      borderBottom: `1px solid ${cardColors.border}`,
                    }}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: cardColors.placeholder, border: `1px solid ${cardColors.border}` }}>
                      {item.image ? (
                        <NextImage src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5" style={{ color: cardColors.muted }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: cardColors.text }}>{item.name}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: cardColors.text }}>{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${cardColors.border}` }}>
                          <button
                            onClick={() => updateCartQty(item.id, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3 w-3" style={{ color: cardColors.muted }} />
                          </button>
                          <span className="h-7 w-8 flex items-center justify-center text-xs font-semibold" style={{ color: cardColors.text, borderLeft: `1px solid ${cardColors.border}`, borderRight: `1px solid ${cardColors.border}` }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-3 w-3" style={{ color: cardColors.muted }} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartMounted && cartItems.length > 0 && (
            <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${cardColors.border}` }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: cardColors.muted }}>Subtotal</span>
                <span className="text-xl font-bold" style={{ color: cardColors.text }}>{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs" style={{ color: darkBg ? '#64748b' : '#9ca3af' }}>Envío calculado en el checkout</p>
              <a
                href={`/${slug}/checkout`}
                className="block w-full h-11 rounded-lg text-sm font-semibold text-white text-center leading-[2.75rem] transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                style={{ backgroundColor: colors.primary }}
              >
                Finalizar compra
              </a>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full h-10 rounded-lg text-sm font-medium transition-all"
                style={{
                  border: `1px solid ${cardColors.border}`,
                  color: cardColors.text,
                  backgroundColor: 'transparent',
                }}
              >
                Seguir comprando
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  // ─── Profile Photo Component ─────────────────────────────
  const GLOW_SIZES: Record<string, Record<string, string>> = {
    subtle: { sm: '-inset-1', md: '-inset-1.5', lg: '-inset-2' },
    medium: { sm: '-inset-2', md: '-inset-3', lg: '-inset-4' },
    strong: { sm: '-inset-3', md: '-inset-5', lg: '-inset-7' },
  };
  const GLOW_BLUR: Record<string, string> = { subtle: 'blur-md', medium: 'blur-xl', strong: 'blur-2xl' };
  const GLOW_OPACITY: Record<string, string> = { subtle: 'opacity-30', medium: 'opacity-50', strong: 'opacity-70' };

  const ProfilePhoto = ({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) => {
    if (profilePhotoStyle === 'none') return null;
    const basePx = { sm: 40, md: 64, lg: 96 };
    const px = basePx[size];
    const radius = profilePhotoStyle === 'round' ? 'rounded-full' : 'rounded-2xl';
    const hasTransform = logoScale !== 1 || logoOffsetX !== 0 || logoOffsetY !== 0;

    return (
      <div className="relative shrink-0">
        {/* Glow behind logo */}
        {logoGlowEnabled && (
          <div
            className={`absolute ${GLOW_SIZES[logoGlowIntensity]?.[size] || '-inset-3'} ${radius} ${GLOW_BLUR[logoGlowIntensity] || 'blur-xl'} ${GLOW_OPACITY[logoGlowIntensity] || 'opacity-50'}`}
            style={{ backgroundColor: logoGlowColor }}
          />
        )}
        <div
          className={`relative ${radius} overflow-hidden border-[3px] border-white shadow-xl bg-white ring-2 ring-white/20`}
          style={{ width: px, height: px }}
        >
          {logoUrl ? (
            <NextImage
              src={logoUrl}
              alt={tenant.name}
              width={Math.round(px * Math.max(logoScale, 1))}
              height={Math.round(px * Math.max(logoScale, 1))}
              className="object-cover w-full h-full"
              style={hasTransform ? { transform: `scale(${logoScale})${logoOffsetX || logoOffsetY ? ` translate(${logoOffsetX}%, ${logoOffsetY}%)` : ''}`, transformOrigin: 'center' } : undefined}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.primary, fontSize: Math.max(12, Math.round(px * 0.35)) }}>
              {tenant.name[0]}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Social Bar ──────────────────────────────────────────
  const SocialBar = ({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'light' }) => {
    const isLight = variant === 'light';
    const iconBtnBase = `inline-flex items-center justify-center transition-all`;
    const iconSize = 'h-9 w-9 sm:h-10 sm:w-10';
    const lightStyle = 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm';
    const darkStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconBtnBase} ${iconSize} rounded-full ${
              isLight ? 'bg-green-500/80 hover:bg-green-500 text-white backdrop-blur-sm' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
        {tenant.instagram && (
          <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className={`${iconBtnBase} ${iconSize} rounded-full ${isLight ? lightStyle : darkStyle}`}
            title="Instagram">
            <Instagram className="h-4 w-4" />
          </a>
        )}
        {tenant.facebook && (
          <a href={tenant.facebook} target="_blank" rel="noopener noreferrer"
            className={`${iconBtnBase} ${iconSize} rounded-full ${isLight ? lightStyle : darkStyle}`}
            title="Facebook">
            <Facebook className="h-4 w-4" />
          </a>
        )}
        {tenant.address && (
          <span
            className={`${iconBtnBase} ${iconSize} rounded-full ${isLight ? lightStyle : darkStyle} cursor-default`}
            title={`${tenant.address}${tenant.city ? `, ${tenant.city}` : ''}`}
          >
            <MapPin className="h-4 w-4" />
          </span>
        )}
      </div>
    );
  };

  // ─── Price Display ─────────────────────────────────────────
  const PriceDisplay = ({ product }: { product: Product }) => {
    if (!showPrices) return null;
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

    switch (priceStyle) {
      case 'badge':
        return (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`font-bold text-sm px-2.5 py-0.5 ${btnRadius} text-white`} style={{ backgroundColor: colors.primary }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.compareAtPrice!)}</span>}
          </div>
        );
      case 'highlight':
        return (
          <div className="mt-2 px-2 py-1 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base" style={{ color: colors.primary }}>{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.compareAtPrice!)}</span>}
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="mt-1.5">
            <span className="text-sm font-medium" style={{ color: cardColors.muted }}>{formatPrice(product.price)}</span>
            {hasDiscount && <span className="text-[10px] line-through ml-1.5" style={{ color: darkBg ? '#64748b' : '#94a3b8' }}>{formatPrice(product.compareAtPrice!)}</span>}
          </div>
        );
      default:
        return (
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-bold text-base" style={{ color: cardColors.text }}>{formatPrice(product.price)}</span>
            {hasDiscount && <span className="text-xs line-through" style={{ color: darkBg ? '#64748b' : '#94a3b8' }}>{formatPrice(product.compareAtPrice!)}</span>}
          </div>
        );
    }
  };

  // ─── CTA Button ────────────────────────────────────────────
  const CTAButton = ({ product, variant = 'default' }: { product: Product; variant?: 'default' | 'card-rounded' }) => {
    const outOfStock = product.trackInventory && product.stock === 0;

    // Ecommerce mode: show "Add to Cart" button
    if (isEcommerce) {
      return (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!outOfStock) handleAddToCart(product); }}
            disabled={outOfStock}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 ${btnRadius} text-white transition-all ${
              outOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.97]'
            }`}
            style={{ backgroundColor: colors.primary }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock ? 'Sin stock' : 'Agregar'}
          </button>
          {whatsappNumber && (
            <a
              href={getWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center justify-center h-[34px] w-[34px] ${btnRadius} bg-green-500 text-white hover:bg-green-600 transition-all shrink-0`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      );
    }

    // Default mode: WhatsApp only
    if (!showWhatsappButton || !whatsappNumber || outOfStock) return null;

    const ghostStyles = isGhostBtn
      ? { borderColor: colors.primary, color: colors.primary }
      : undefined;

    const baseClass = variant === 'card-rounded'
      ? `mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 ${btnRadius} transition-all`
      : `mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 ${btnRadius} transition-all`;

    return (
      <a
        href={getWhatsAppLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`${baseClass} ${
          isGhostBtn
            ? 'hover:opacity-80'
            : variant === 'card-rounded'
              ? 'hover:opacity-90'
              : 'text-white bg-green-500 hover:bg-green-600'
        }`}
        style={
          isGhostBtn
            ? ghostStyles
            : variant === 'card-rounded'
              ? { backgroundColor: `${colors.primary}12`, color: colors.primary }
              : undefined
        }
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {buttonText}
      </a>
    );
  };

  // ─── Hero Renderers ──────────────────────────────────────
  const renderHero = () => {
    // bannerContent WITHOUT overlay — each hero applies its own if needed
    const bannerContent = bannerUrl ? (
      <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover" sizes="100vw" priority />
    ) : (
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
    );

    // Trust/shipping badge for premium heroes
    const TrustBadge = () => (
      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-white/70 mt-2">
        <Package className="h-3 w-3" />
        <span>Tienda verificada</span>
        {tenant.address && (
          <>
            <span className="mx-1 text-white/30">|</span>
            <MapPin className="h-3 w-3" />
            <span>{tenant.city || tenant.address}</span>
          </>
        )}
      </div>
    );

    switch (heroStyle) {
      // ─── CLASSIC — Glassmorphism info bar at bottom ─────────────
      case 'classic':
        return (
          <header>
            <div className="relative">
              <div className={`relative ${heroHeightClass}`}>
                {bannerContent}
              </div>
              {/* Glassmorphism info bar — positioned at bottom of banner */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-10">
                <div className="max-w-6xl mx-auto px-3 sm:px-4">
                  <div
                    className={`${cardRadius} border border-white/20 shadow-2xl px-3 py-2.5 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-4`}
                    style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                  >
                    <ProfilePhoto size="sm" />
                    <div className="flex-1 min-w-0">
                      <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-white truncate" style={{ fontFamily: headingFont }}>
                        {storeName}
                      </h1>
                      {storeDesc && <p className="text-[10px] sm:text-sm text-white/60 mt-0.5 line-clamp-2">{storeDesc}</p>}
                    </div>
                    {/* Desktop social */}
                    <div className="hidden sm:block shrink-0">
                      <SocialBar variant="light" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Spacer for the floating bar */}
            <div className="h-10 sm:h-14" />
            {/* Mobile: social icons below bar */}
            <div className="max-w-6xl mx-auto px-4 pt-2 sm:hidden">
              <SocialBar className="justify-center" />
            </div>
          </header>
        );

      // ─── CENTERED — Elegant center-aligned with ring glow ─────
      case 'centered':
        return (
          <header className="relative overflow-hidden">
            {bannerUrl ? (
              <div className={`relative ${heroHeightClass} min-h-[260px] sm:min-h-0`}>
                {bannerContent}
                {/* Scrim only behind text area — not full image */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-6 sm:pt-0 pb-3 sm:pb-0">
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)' }} />
                  <div className="relative">
                    <ProfilePhoto size="md" />
                    <h1 className="text-lg sm:text-3xl md:text-4xl font-bold text-white mt-2 sm:mt-3" style={{ fontFamily: headingFont, textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)' }}>
                      {storeName}
                    </h1>
                    {storeDesc && (
                      <p className="text-[10px] sm:text-sm text-white/90 mt-1 sm:mt-1.5 max-w-[260px] sm:max-w-md line-clamp-2" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                        {storeDesc}
                      </p>
                    )}
                    <div className="mt-2 sm:mt-4">
                      <SocialBar className="justify-center" variant="light" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-6 sm:pt-16 pb-5 sm:pb-10 text-center relative" style={{ backgroundColor: colors.bg }}>
                {/* Subtle decorative gradient */}
                <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${colors.primary}, transparent 70%)` }} />
                <div className="max-w-6xl mx-auto px-4 flex flex-col items-center relative">
                  <ProfilePhoto size="lg" />
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mt-2 sm:mt-3" style={{ color: colors.text, fontFamily: headingFont }}>
                    {storeName}
                  </h1>
                  {storeDesc && <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 max-w-[260px] sm:max-w-md line-clamp-2">{storeDesc}</p>}
                  <div className="mt-3 sm:mt-4">
                    <SocialBar className="justify-center" />
                  </div>
                </div>
              </div>
            )}
          </header>
        );

      // ─── BANNER — Bold editorial typography ───────────────────
      case 'banner':
        return (
          <header className="relative">
            <div className={`relative ${heroHeightClass}`}>
              {bannerContent}
              {/* Bottom-only gradient for text legibility — image stays clean on top */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 pb-5 sm:pb-10">
                <div className="max-w-6xl mx-auto w-full">
                  {profilePhotoStyle !== 'none' && (
                    <div className="mb-2 sm:mb-3">
                      <ProfilePhoto size="sm" />
                    </div>
                  )}
                  <h1
                    className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight max-w-3xl"
                    style={{ fontFamily: headingFont, textShadow: '0 2px 20px rgba(0,0,0,0.3), 0 4px 40px rgba(0,0,0,0.2)' }}
                  >
                    {storeName}
                  </h1>
                  {storeDesc && (
                    <p className="text-xs sm:text-base text-white/75 mt-2 sm:mt-3 max-w-lg font-light line-clamp-2" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
                      {storeDesc}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 mt-3 sm:mt-6 flex-wrap">
                    <SocialBar variant="light" />
                  </div>
                </div>
              </div>
            </div>
          </header>
        );

      // ─── SPLIT — Asymmetric with accent line ─────────────────
      case 'split':
        return (
          <header className="relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col-reverse sm:flex-row items-stretch min-h-0 sm:min-h-[360px]">
                {/* Text side */}
                <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-5 sm:py-10 relative">
                  {/* Accent line */}
                  <div className="w-8 h-0.5 sm:w-10 sm:h-1 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: colors.primary }} />
                  <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                    <ProfilePhoto size="sm" />
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: colors.primary, backgroundColor: `${colors.primary}10` }}>
                      Tienda online
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: colors.text, fontFamily: headingFont }}>
                    {storeName}
                  </h1>
                  {storeDesc && <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 max-w-md leading-relaxed line-clamp-2">{storeDesc}</p>}
                  <div className="flex items-center gap-2.5 mt-4 sm:mt-5 flex-wrap">
                    <SocialBar />
                  </div>
                </div>
                {/* Image side */}
                {bannerUrl && (
                  <div className="relative w-full sm:w-[48%] h-40 sm:h-auto shrink-0">
                    <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 48vw" priority />
                    {/* Fade edge */}
                    <div className="absolute inset-y-0 left-0 w-16 hidden sm:block" style={{ background: `linear-gradient(to right, ${colors.bg}, transparent)` }} />
                    {/* Mobile bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-10 sm:hidden" style={{ background: `linear-gradient(to top, ${colors.bg}, transparent)` }} />
                  </div>
                )}
              </div>
            </div>
          </header>
        );

      // ─── MINIMAL — Clean Apple-style with accent border ──────
      case 'minimal':
        return (
          <header style={{ backgroundColor: colors.bg }}>
            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <ProfilePhoto size="sm" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate" style={{ color: colors.text, fontFamily: headingFont }}>
                    {storeName}
                  </h1>
                  {storeDesc && <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{storeDesc}</p>}
                </div>
                {/* Desktop social */}
                <div className="hidden sm:block shrink-0">
                  <SocialBar />
                </div>
              </div>
              {/* Mobile social */}
              <div className="sm:hidden mt-2.5">
                <SocialBar />
              </div>
            </div>
            {/* Accent border */}
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, transparent)` }} />
          </header>
        );

      // ─── GRADIENT — Mesh-style with depth layers ─────────────
      case 'gradient':
        return (
          <header className="relative overflow-hidden">
            <div
              className={`relative ${heroHeightClass}`}
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent || colors.primary}88)` }}
            >
              {/* Floating orbs for depth */}
              <div className="absolute top-[10%] right-[5%] w-32 sm:w-64 h-32 sm:h-64 rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: '#fff' }} />
              <div className="absolute bottom-[20%] left-[8%] w-24 sm:w-48 h-24 sm:h-48 rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: '#fff' }} />
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <div className="absolute inset-0 flex items-end pb-5 sm:pb-10">
                <div className="max-w-6xl mx-auto px-4 w-full">
                  <div className="flex items-end gap-2.5 sm:gap-4">
                    <ProfilePhoto size="md" />
                    <div className="pb-0.5 flex-1 min-w-0">
                      <h1 className="text-lg sm:text-3xl md:text-4xl font-bold text-white truncate" style={{ fontFamily: headingFont, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                        {storeName}
                      </h1>
                      {storeDesc && <p className="text-[11px] sm:text-sm text-white/70 mt-0.5 line-clamp-2">{storeDesc}</p>}
                      <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                        <SocialBar variant="light" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        );

      // ─── GLASSMORPHISM — Premium frosted glass ──────────────
      case 'glassmorphism':
        return (
          <header className="relative overflow-hidden">
            <div className={`relative ${heroHeightClass}`}>
              {bannerUrl ? (
                <>
                  <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover scale-105" sizes="100vw" priority />
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
              )}
              {/* Frosted glass card — centered */}
              <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
                <div
                  className={`w-full max-w-sm sm:max-w-md ${cardRadius} p-4 sm:p-7 text-center border border-white/20 shadow-2xl`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(24px) saturate(1.5)', WebkitBackdropFilter: 'blur(24px) saturate(1.5)' }}
                >
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <ProfilePhoto size="md" />
                  </div>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: headingFont, textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
                    {storeName}
                  </h1>
                  {storeDesc && (
                    <p className="text-[11px] sm:text-sm text-white/70 mt-1.5 max-w-xs mx-auto leading-relaxed line-clamp-2">
                      {storeDesc}
                    </p>
                  )}
                  <div className="mt-3 sm:mt-4 flex justify-center">
                    <SocialBar variant="light" className="justify-center" />
                  </div>
                </div>
              </div>
            </div>
          </header>
        );

      // ─── EDITORIAL — Magazine-style massive typography ──────
      case 'editorial':
        return (
          <header className="relative overflow-hidden bg-slate-950">
            <div className={`relative min-h-[280px] sm:min-h-0 ${heroHeightClass}`}>
              {/* Subtle background image or gradient */}
              {bannerUrl ? (
                <>
                  <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover opacity-40" sizes="100vw" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${colors.primary}15, transparent 40%, ${colors.secondary}10)` }} />
              )}

              <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 pt-10 sm:pt-0 pb-5 sm:pb-10">
                <div className="max-w-6xl mx-auto w-full">
                  {/* Small logo + label */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-6">
                    <ProfilePhoto size="sm" />
                    <div className="h-px flex-1 max-w-[40px] sm:max-w-[60px]" style={{ backgroundColor: colors.primary }} />
                    <span className="text-[9px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                      Tienda
                    </span>
                  </div>
                  {/* Store name — responsive sizing */}
                  <h1
                    className="text-2xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight"
                    style={{ fontFamily: headingFont }}
                  >
                    {storeName}
                  </h1>
                  {/* Accent line */}
                  <div className="w-12 sm:w-24 h-0.5 sm:h-1 rounded-full mt-2 sm:mt-6" style={{ backgroundColor: colors.primary }} />
                  {storeDesc && (
                    <p className="text-xs sm:text-base text-white/50 mt-2 sm:mt-4 max-w-lg font-light leading-relaxed line-clamp-2">
                      {storeDesc}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 mt-3 sm:mt-7 flex-wrap">
                    <SocialBar variant="light" />
                  </div>
                </div>
              </div>
            </div>
          </header>
        );

      // ─── FULLSCREEN — Immersive full-viewport ──────────────
      case 'fullscreen':
        return (
          <header className="relative h-[80vh] sm:h-[90vh] overflow-hidden">
            {bannerUrl ? (
              <>
                <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover" sizes="100vw" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5" />
              </>
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            {/* Content at bottom */}
            <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-12 px-4">
              <div className="max-w-6xl mx-auto text-center">
                <div className="flex justify-center mb-3">
                  <ProfilePhoto size="md" />
                </div>
                <h1
                  className="text-xl sm:text-4xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: headingFont, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
                >
                  {storeName}
                </h1>
                {storeDesc && (
                  <p className="text-xs sm:text-base text-white/70 mt-1.5 max-w-md mx-auto line-clamp-2">{storeDesc}</p>
                )}
                <div className="flex justify-center mt-4 sm:mt-5">
                  <SocialBar variant="light" className="justify-center" />
                </div>
                {/* Scroll indicator */}
                <div className="mt-4 sm:mt-8 flex flex-col items-center animate-bounce">
                  <ChevronRight className="h-5 w-5 text-white/40 rotate-90" />
                </div>
              </div>
            </div>
          </header>
        );

      // ─── FLOATING — Card floating over banner ──────────────
      case 'floating':
        return (
          <header className="relative">
            {/* Banner background — shorter */}
            <div className="relative h-32 sm:h-48 md:h-56">
              {bannerUrl ? (
                <>
                  <NextImage src={bannerUrl} alt={tenant.name} fill className="object-cover" sizes="100vw" priority />
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
              )}
            </div>
            {/* Floating card */}
            <div className="relative z-10 -mt-12 sm:-mt-16 px-3 sm:px-4">
              <div className="max-w-2xl mx-auto">
                <div
                  className={`${cardRadius} bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 p-3.5 sm:p-6`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <ProfilePhoto size="sm" />
                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-2xl md:text-3xl font-bold truncate" style={{ color: colors.text, fontFamily: headingFont }}>
                        {storeName}
                      </h1>
                      {storeDesc && <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{storeDesc}</p>}
                    </div>
                  </div>
                  {/* Social icons */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <SocialBar />
                  </div>
                  {/* Product count badge */}
                  {products.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        {products.filter(p => p.isActive).length} productos
                      </span>
                      {categoriesWithCount.length > 0 && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {categoriesWithCount.length} categorías
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        );

      // ─── ECOMMERCE — Professional navbar + banner carousel ─────────────
      case 'ecommerce':
        return <EcommerceHero />;

      default:
        return null;
    }
  };

  // ─── Ecommerce Hero Component (extracted for hooks) ──────
  const EcommerceHero = () => {
    const [ecMobileMenu, setEcMobileMenu] = useState(false);
    const [ecSearchOpen, setEcSearchOpen] = useState(false);
    const [ecSlide, setEcSlide] = useState(0);
    const [ecTransition, setEcTransition] = useState(true);
    const ecAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const ecPaused = useRef(false);
    const ecTouchStart = useRef(0);

    // Banner slides — carousel images first, then banner/cover fallbacks
    const ecSlides = useMemo(() => {
      const slides: { type: 'image' | 'gradient'; src?: string; linkUrl?: string }[] = [];
      // Use carousel images if available
      const carousel = (branding?.carouselImages as Array<{ url: string; linkUrl?: string; order: number }>) || [];
      const sorted = [...carousel].sort((a, b) => a.order - b.order);
      sorted.forEach(img => {
        if (img.url) slides.push({ type: 'image', src: img.url, linkUrl: img.linkUrl });
      });
      // Fallback to banner/cover if no carousel images
      if (slides.length === 0) {
        if (bannerUrl) slides.push({ type: 'image', src: bannerUrl });
        if (branding?.coverImageUrl && branding.coverImageUrl !== bannerUrl) slides.push({ type: 'image', src: branding.coverImageUrl });
      }
      // At least one gradient slide as fallback
      if (slides.length === 0) slides.push({ type: 'gradient' });
      return slides;
    }, [bannerUrl, branding?.coverImageUrl, branding?.carouselImages]);

    const ecTotal = ecSlides.length;

    const ecNext = useCallback(() => {
      setEcTransition(true);
      setEcSlide(s => (s + 1) % ecTotal);
    }, [ecTotal]);

    const ecPrev = useCallback(() => {
      setEcTransition(true);
      setEcSlide(s => (s - 1 + ecTotal) % ecTotal);
    }, [ecTotal]);

    // Auto-play
    useEffect(() => {
      ecAutoRef.current = setInterval(() => {
        if (!ecPaused.current) ecNext();
      }, 5000);
      return () => { if (ecAutoRef.current) clearInterval(ecAutoRef.current); };
    }, [ecNext]);

    // Lock body scroll when mobile menu open
    useEffect(() => {
      if (ecMobileMenu) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
      return () => { document.body.style.overflow = ''; };
    }, [ecMobileMenu]);

    const navLinks = categoriesWithCount.slice(0, 4).map(c => ({ label: c.name, id: c.id }));

    return (
      <header>
        <style>{`
          @keyframes ec-slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes ec-fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes ec-searchExpand { from { width: 0; opacity: 0; } to { width: 16rem; opacity: 1; } }
          @keyframes ec-menuExpand { from { max-height: 0; opacity: 0; } to { max-height: 400px; opacity: 1; } }
          @keyframes ec-navLink { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>

        {/* ── Sticky Navbar ───────────────────────────────── */}
        <nav
          className="sticky top-0 z-50 shadow-lg"
          style={{ backgroundColor: darkBg ? shiftColor(colors.bg, 8) : '#111827' }}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <div className="flex items-center h-14 sm:h-[4.5rem]">

              {/* Logo with profile frame */}
              <a href={`/${slug}`} className="shrink-0 mr-3 sm:mr-6 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                {logoUrl ? (
                  <div
                    className={`relative overflow-hidden shrink-0 ${
                      profilePhotoStyle === 'round' ? 'rounded-full' :
                      profilePhotoStyle === 'square' ? 'rounded-xl' : ''
                    }`}
                    style={{
                      width: 44, height: 44,
                      border: profilePhotoStyle !== 'none' ? '2.5px solid rgba(255,255,255,0.3)' : 'none',
                      boxShadow: profilePhotoStyle !== 'none' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    <NextImage
                      src={logoUrl}
                      alt={tenant.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                ) : (
                  <span className="text-white text-lg sm:text-xl font-bold truncate max-w-[140px] block" style={{ fontFamily: headingFont }}>
                    {storeName}
                  </span>
                )}
              </a>

              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-1 flex-1 min-w-0">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => { setActiveCategory(link.id); }}
                    className="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  >
                    {link.label}
                  </button>
                ))}
                {categoriesWithCount.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className="px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
                  >
                    + {categoriesWithCount.length - 4} más
                  </button>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                {/* Desktop Search */}
                <div className="hidden md:flex items-center">
                  {ecSearchOpen ? (
                    <div className="flex items-center" style={{ animation: 'ec-searchExpand 0.3s ease-out forwards' }}>
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        className="h-9 w-64 px-3 rounded-l-lg bg-white/15 border border-white/20 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                      />
                      <button
                        onClick={() => { setEcSearchOpen(false); setSearch(''); }}
                        className="h-9 px-2 rounded-r-lg bg-white/10 border border-l-0 border-white/20 text-white/70 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEcSearchOpen(true)}
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Mobile Search */}
                <button
                  className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => { setEcSearchOpen(!ecSearchOpen); }}
                >
                  <Search className="h-4 w-4" />
                </button>

                {/* WhatsApp */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-lg flex items-center justify-center bg-green-500/80 hover:bg-green-500 text-white transition-all"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}

                {/* Cart Button (only in ecommerce mode) */}
                {isEcommerce && (
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="relative h-9 w-9 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartMounted && cartCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1"
                        style={{ backgroundColor: 'white', color: colors.primary }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => setEcMobileMenu(!ecMobileMenu)}
                >
                  {ecMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Search Expand */}
            {ecSearchOpen && (
              <div className="md:hidden pb-2.5" style={{ animation: 'ec-fadeIn 0.2s ease-out' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full h-10 pl-9 pr-9 rounded-lg bg-white/15 border border-white/20 text-white text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-white/50" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Panel */}
          {ecMobileMenu && (
            <div
              className="md:hidden border-t border-white/10 overflow-hidden"
              style={{ animation: 'ec-menuExpand 0.35s ease-out forwards' }}
            >
              <div className="max-w-6xl mx-auto px-3 py-3 space-y-0.5">
                {navLinks.map((link, idx) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => { setActiveCategory(link.id); setEcMobileMenu(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
                    style={{ animation: `ec-navLink 0.3s ${idx * 0.05}s ease-out both` }}
                  >
                    {link.label}
                  </button>
                ))}
                {categoriesWithCount.length > 4 && categoriesWithCount.slice(4).map((link, idx) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => { setActiveCategory(link.id); setEcMobileMenu(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all"
                    style={{ animation: `ec-navLink 0.3s ${(navLinks.length + idx) * 0.05}s ease-out both` }}
                  >
                    {link.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setEcMobileMenu(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-sm transition-all"
                  style={{ animation: `ec-navLink 0.3s ${(navLinks.length + categoriesWithCount.length) * 0.05}s ease-out both` }}
                >
                  Ver todo
                </button>
                {/* Social links in mobile menu */}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <SocialBar variant="light" />
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Banner Carousel ──────────────────────────────── */}
        <section
          className="pt-3 sm:pt-4 pb-4 sm:pb-6 overflow-hidden"
          style={{
            background: darkBg
              ? `linear-gradient(to bottom, ${shiftColor(colors.bg, 8)} 0%, ${colors.bg} 100%)`
              : `linear-gradient(to bottom, #111827 0%, #111827 30%, #1f2937 50%, #4b5563 70%, #9ca3af 85%, ${colors.bg} 100%)`,
          }}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            {/* Carousel container */}
            <div
              className="relative group"
              onMouseEnter={() => { ecPaused.current = true; }}
              onMouseLeave={() => { ecPaused.current = false; }}
              onTouchStart={(e) => { ecTouchStart.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const diff = ecTouchStart.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) diff > 0 ? ecNext() : ecPrev();
              }}
            >
              {/* Slides wrapper — card carousel with translate3d */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-800 aspect-[1080/566] sm:aspect-[16/5]">
                {ecSlides.map((slide, idx) => {
                  // Calculate offset from current slide
                  let offset = idx - ecSlide;
                  // Circular wrap — if offset is more than half, wrap around
                  if (offset > ecTotal / 2) offset -= ecTotal;
                  if (offset < -ecTotal / 2) offset += ecTotal;
                  // Only animate cards participating in the transition (current + adjacent)
                  const isParticipating = Math.abs(offset) <= 1;

                  const slideContent = (
                    <div
                      className="absolute inset-0 w-[96%] mx-auto rounded-2xl overflow-hidden"
                      style={{
                        transform: `translate3d(${offset * 98}%, 0, 0)`,
                        transition: isParticipating ? 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                        zIndex: offset === 0 ? 2 : 1,
                        willChange: isParticipating ? 'transform' : undefined,
                      }}
                    >
                      {slide.type === 'image' && slide.src ? (
                        <NextImage
                          src={slide.src}
                          alt={`Banner ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 1200px"
                          priority={idx < 2}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                          <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-3 opacity-80" />
                          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-center px-4" style={{ fontFamily: headingFont }}>
                            {storeName}
                          </h2>
                          {storeDesc && (
                            <p className="text-xs sm:text-sm text-white/70 mt-1 text-center px-8 max-w-lg">
                              {storeDesc}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );

                  // Wrap in Link if slide has linkUrl
                  if (slide.linkUrl) {
                    return <Link key={idx} href={slide.linkUrl}>{slideContent}</Link>;
                  }
                  return <div key={idx}>{slideContent}</div>;
                })}
              </div>

              {/* Arrows — visible on hover */}
              {ecTotal > 1 && (
                <>
                  <button
                    onClick={ecPrev}
                    className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={ecNext}
                    className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </>
              )}

              {/* Dots indicator */}
              {ecTotal > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:gap-2">
                  {ecSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEcSlide(idx)}
                      className={`rounded-full transition-all duration-500 ${
                        idx === ecSlide
                          ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow-md'
                          : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
          </div>
          </div>
        </section>
      </header>
    );
  };

  // ─── Product Card Renderer ───────────────────────────────
  const renderProductCard = (product: Product) => {
    const image = getPrimaryImage(product);
    const isLowStock = product.trackInventory && showStock && product.stock <= product.lowStockThreshold;
    const isOutOfStock = product.trackInventory && product.stock === 0;
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

    const badges = (
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-[1]">
        {product.isFeatured && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 ${btnRadius} text-white`} style={{ backgroundColor: colors.primary }}>
            <Star className="h-2.5 w-2.5 fill-current" />
            Destacado
          </span>
        )}
        {hasDiscount && (
          <span className={`text-[10px] font-bold px-2 py-0.5 ${btnRadius} bg-red-500 text-white`}>
            -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
          </span>
        )}
      </div>
    );

    const outOfStockOverlay = isOutOfStock && (
      <div className="absolute inset-0 flex items-center justify-center z-[1]" style={{ backgroundColor: darkBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }}>
        <span className={`text-xs font-bold px-3 py-1 ${btnRadius} border`} style={{ color: cardColors.muted, backgroundColor: cardColors.surfaceElevated, borderColor: cardColors.border }}>Agotado</span>
      </div>
    );

    const productImage = (extraClass: string = '') => (
      <div className={`relative ${aspectClass} ${extraClass}`} style={{ backgroundColor: cardColors.placeholder }}>
        {image ? (
          <NextImage src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8" style={{ color: cardColors.border }} />
          </div>
        )}
        {badges}
        {outOfStockOverlay}
      </div>
    );

    const stockIndicator = showStock && product.trackInventory && !isOutOfStock && (
      <p className={`text-[10px] mt-1 font-medium`} style={{ color: isLowStock ? '#ef4444' : cardColors.muted }}>
        {isLowStock ? `Últimas ${product.stock} unidades` : `${product.stock} disponibles`}
      </p>
    );

    const categoryLabel = product.category && (
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: colors.primary }}>
        {product.category.name}
      </p>
    );

    const productName = (
      <h3 className="font-semibold text-sm line-clamp-2 leading-tight" style={{ color: cardColors.text, fontFamily: headingFont }}>
        {product.name}
      </h3>
    );

    switch (cardStyle) {
      // ─── STANDARD — Clean elevated card ───────────────────
      case 'standard':
        return (
          <Link
            key={product.id}
            href={`/${slug}/producto/${product.slug}`}
            className={`group flex flex-col h-full ${cardRadius} border overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}
            style={{
              backgroundColor: cardColors.surfaceElevated,
              borderColor: cardColors.border,
              boxShadow: cardColors.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cardColors.hoverBorder;
              e.currentTarget.style.boxShadow = cardColors.shadowHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardColors.border;
              e.currentTarget.style.boxShadow = cardColors.shadow;
            }}
          >
            {productImage()}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex-1">
                {categoryLabel}
                {productName}
                {product.shortDescription && <p className="text-xs mt-1 line-clamp-1" style={{ color: cardColors.muted }}>{product.shortDescription}</p>}
                <PriceDisplay product={product} />
                {stockIndicator}
                {product.variants && product.variants.length > 0 && <p className="text-[10px] mt-1" style={{ color: cardColors.muted }}>{product.variants.length} opciones</p>}
              </div>
              <CTAButton product={product} />
            </div>
          </Link>
        );

      // ─── MINIMAL — No container, clean product focus ──────
      case 'minimal':
        return (
          <Link key={product.id} href={`/${slug}/producto/${product.slug}`} className="group flex flex-col h-full hover:opacity-80 transition-opacity">
            {productImage(`${cardRadius} overflow-hidden`)}
            <div className="pt-2.5 px-0.5 flex-1">
              {productName}
              <PriceDisplay product={product} />
            </div>
          </Link>
        );

      // ─── COMPACT — Horizontal list item ───────────────────
      case 'compact':
        return (
          <Link
            key={product.id}
            href={`/${slug}/producto/${product.slug}`}
            className={`group flex gap-3 p-3 ${cardRadius} border transition-all`}
            style={{
              backgroundColor: cardColors.surfaceElevated,
              borderColor: cardColors.border,
              boxShadow: cardColors.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cardColors.hoverBorder;
              e.currentTarget.style.boxShadow = cardColors.shadowHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardColors.border;
              e.currentTarget.style.boxShadow = cardColors.shadow;
            }}
          >
            <div className={`relative h-24 w-24 ${cardRadius} overflow-hidden shrink-0`} style={{ backgroundColor: cardColors.placeholder }}>
              {image ? (
                <NextImage src={image} alt={product.name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6" style={{ color: cardColors.border }} />
                </div>
              )}
              {badges}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {categoryLabel}
              {productName}
              {product.shortDescription && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: cardColors.muted }}>{product.shortDescription}</p>}
              <PriceDisplay product={product} />
              {stockIndicator}
            </div>
          </Link>
        );

      // ─── EDITORIAL — Magazine overlay on image ────────────
      case 'editorial':
        return (
          <Link key={product.id} href={`/${slug}/producto/${product.slug}`} className={`group flex flex-col h-full ${cardRadius} overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 relative`}>
            <div className="relative aspect-[3/4]" style={{ backgroundColor: cardColors.placeholder }}>
              {image ? (
                <NextImage src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 33vw" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-8 w-8" style={{ color: cardColors.border }} /></div>
              )}
              {badges}
              {outOfStockOverlay}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-20">
              {product.category && <p className="text-[10px] font-medium uppercase tracking-wider mb-1 text-white/70">{product.category.name}</p>}
              <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight" style={{ fontFamily: headingFont }}>
                {product.name}
              </h3>
              {showPrices && (
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bold text-base text-white">{formatPrice(product.price)}</span>
                  {hasDiscount && <span className="text-xs text-white/60 line-through">{formatPrice(product.compareAtPrice!)}</span>}
                </div>
              )}
            </div>
          </Link>
        );

      // ─── DETAILED — Rich info card ────────────────────────
      case 'detailed':
        return (
          <Link
            key={product.id}
            href={`/${slug}/producto/${product.slug}`}
            className={`group flex flex-col h-full ${cardRadius} border overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}
            style={{
              backgroundColor: cardColors.surfaceElevated,
              borderColor: cardColors.border,
              boxShadow: cardColors.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cardColors.hoverBorder;
              e.currentTarget.style.boxShadow = cardColors.shadowHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardColors.border;
              e.currentTarget.style.boxShadow = cardColors.shadow;
            }}
          >
            {productImage()}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex-1">
                {categoryLabel}
                {productName}
                {product.shortDescription && <p className="text-xs mt-1 line-clamp-2" style={{ color: cardColors.muted }}>{product.shortDescription}</p>}
                <div className="flex items-center justify-between mt-2">
                  <PriceDisplay product={product} />
                  {showStock && product.trackInventory && !isOutOfStock && (
                    <span
                      className={`text-[10px] px-2 py-0.5 ${btnRadius}`}
                      style={{
                        backgroundColor: isLowStock ? (darkBg ? '#7f1d1d' : '#fef2f2') : (darkBg ? '#064e3b' : '#ecfdf5'),
                        color: isLowStock ? (darkBg ? '#fca5a5' : '#dc2626') : (darkBg ? '#6ee7b7' : '#059669'),
                      }}
                    >
                      {isLowStock ? 'Últimas unidades' : 'En stock'}
                    </span>
                  )}
                </div>
                {product.variants && product.variants.length > 0 && <p className="text-[10px] mt-1" style={{ color: cardColors.muted }}>{product.variants.length} opciones disponibles</p>}
              </div>
              <CTAButton product={product} />
            </div>
          </Link>
        );

      // ─── ROUNDED — Soft premium card ──────────────────────
      case 'rounded':
        return (
          <Link
            key={product.id}
            href={`/${slug}/producto/${product.slug}`}
            className="group flex flex-col h-full rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: cardColors.surfaceElevated,
              borderColor: cardColors.border,
              boxShadow: cardColors.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cardColors.hoverBorder;
              e.currentTarget.style.boxShadow = cardColors.shadowHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardColors.border;
              e.currentTarget.style.boxShadow = cardColors.shadow;
            }}
          >
            {productImage()}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex-1">
                {categoryLabel}
                {productName}
                <PriceDisplay product={product} />
              </div>
              <CTAButton product={product} variant="card-rounded" />
            </div>
          </Link>
        );

      default:
        return null;
    }
  };

  // ─── Category Filter Renderer ──────────────────────────────
  const renderCategories = () => {
    if (!showCategoryFilter || categoriesWithCount.length === 0) return null;

    const allCategories = [{ id: 'all', name: 'Todos', image: null as string | null }, ...categoriesWithCount];
    const hasImages = categoriesWithCount.some((c: any) => c.image);
    const activeProducts = products.filter(p => p.isActive);
    const getCatCount = (catId: string) =>
      catId === 'all' ? activeProducts.length : activeProducts.filter(p => p.categoryId === catId).length;

    const inactiveStyle = {
      backgroundColor: darkBg ? cardColors.surface : '#f1f5f9',
      color: cardColors.muted,
    };
    const activeStyle = { backgroundColor: colors.primary, color: '#ffffff' };

    // ── Visual image cards ──
    if (hasImages && categoryStyle !== 'underline') {
      return (
        <div className="flex gap-2.5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory mb-4">
          {allCategories.map((cat: any) => {
            const isActive = activeCategory === cat.id;
            const count = getCatCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group relative shrink-0 snap-start w-[5.5rem] sm:w-28 aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'ring-2 ring-offset-2 shadow-lg'
                    : 'active:scale-95 sm:hover:scale-[1.02] sm:hover:shadow-md opacity-75 hover:opacity-100'
                }`}
                style={isActive ? { ['--tw-ring-color' as string]: colors.primary, ['--tw-ring-offset-color' as string]: cardColors.surface } as React.CSSProperties : undefined}
              >
                {cat.image ? (
                  <>
                    <NextImage src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 5.5rem, 7rem" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0" style={{ background: cat.id === 'all' ? (darkBg ? '#374151' : '#475569') : `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)` }} />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-2 text-white">
                  <span className="text-[11px] sm:text-sm font-semibold leading-tight text-center drop-shadow-sm line-clamp-2">{cat.name}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">{count}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    // Uniform width for all category buttons
    const catBtnClass = 'shrink-0 w-[7rem] sm:w-[7.5rem] flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95';

    switch (categoryStyle) {
      case 'underline':
        return (
          <div className="flex gap-1 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide border-b mb-6" style={{ borderColor: cardColors.border }}>
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = getCatCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 w-[6.5rem] sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-4 py-2.5 sm:py-2.5 text-sm font-medium transition-all border-b-2 ${
                    isActive ? 'border-current' : 'border-transparent'
                  }`}
                  style={isActive ? { color: colors.primary } : { color: cardColors.muted }}
                >
                  <span className="truncate max-w-full">{cat.name}</span>
                  <span className="text-[10px] sm:text-[11px]" style={{
                    color: isActive ? colors.primary : cardColors.muted,
                    opacity: 0.7,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'cards':
        return (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-4">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = getCatCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${catBtnClass} border ${
                    isActive ? 'shadow-md' : 'sm:hover:shadow-sm'
                  }`}
                  style={isActive
                    ? { ...activeStyle, borderColor: 'transparent' }
                    : { ...inactiveStyle, backgroundColor: cardColors.surfaceElevated, borderColor: cardColors.border }
                  }
                >
                  <span className="truncate max-w-full">{cat.name}</span>
                  <span className="text-[10px] font-normal" style={{ opacity: 0.6 }}>
                    {count} prod.
                  </span>
                </button>
              );
            })}
          </div>
        );

      default: // pills
        return (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = getCatCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${catBtnClass} ${
                    isActive ? 'shadow-md shadow-black/10' : ''
                  }`}
                  style={isActive ? activeStyle : inactiveStyle}
                >
                  <span className="truncate max-w-full">{cat.name}</span>
                  <span className="text-[10px] font-normal" style={{ opacity: isActive ? 0.8 : 0.5 }}>
                    {count} prod.
                  </span>
                </button>
              );
            })}
          </div>
        );
    }
  };

  // ─── Grid class based on card style + mobile columns ───────
  const getGridClass = () => {
    const mobileCols = mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2';
    if (cardStyle === 'compact') return 'grid grid-cols-1 sm:grid-cols-2 gap-3';
    return `grid ${mobileCols} sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`;
  };

  return (
    <div className="relative min-h-screen" style={{
      backgroundColor: colors.bg,
      ...(gradientEnabled ? {
        background: gradientStyle === 'immersive'
          ? (() => {
              // DARK → WHITE → DARK (immersive style)
              const parse = (hex: string) => {
                const c = hex.replace('#', '');
                return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
              };
              const toHex = (r: number, g: number, b: number) =>
                `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
              const navDark = darkBg ? shiftColor(colors.bg, 8) : '#111827';
              const [rD, gD, bD] = parse(navDark);
              const [rL, gL, bL] = parse(gradientFrom);
              const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
              const mix = (t: number) => toHex(lerp(rD, rL, t), lerp(gD, gL, t), lerp(bD, bL, t));
              const stops = [
                `${mix(0)} 0%`, `${mix(0)} 4%`, `${mix(0.1)} 8%`, `${mix(0.3)} 12%`,
                `${mix(0.6)} 16%`, `${mix(0.85)} 20%`, `${mix(1)} 25%`,
                `${mix(1)} 50%`,
                `${mix(0.95)} 58%`, `${mix(0.85)} 65%`, `${mix(0.65)} 72%`,
                `${mix(0.45)} 80%`, `${mix(0.2)} 88%`, `${mix(0.05)} 95%`, `${mix(0)} 100%`,
              ];
              return `linear-gradient(180deg, ${stops.join(', ')})`;
            })()
          : buildSmoothGradient(gradientFrom, gradientTo),
      } : {}),
    }}>
      {/* Background effect layer — fixed, covers entire viewport while scrolling */}
      <BackgroundEffectLayer effect={bgEffect} color={bgEffectColor} opacity={bgEffectOpacity} isDarkBg={darkBg} />
      {/* Content — above effect layer */}
      <div className="relative" style={{ zIndex: 1 }}>
      {/* Announcement Bar — ecommerce-only feature. Gated here as a safety
          net on top of the backend gate in findPublicBySlug. */}
      {isEcommerce && announcementEnabled && announcementText && (
        <AnnouncementBar
          text={announcementText}
          bgColor={announcementBgColor}
          textColor={announcementTextColor}
          speed={announcementSpeed}
        />
      )}

      {/* Hero */}
      {renderHero()}

      {/* Floating Cart Button — shown when ecommerce is active but hero style doesn't have its own cart icon */}
      {isEcommerce && heroStyle !== 'ecommerce' && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <ShoppingBag className="h-6 w-6" />
          {cartMounted && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 min-w-[24px] flex items-center justify-center text-[11px] font-bold rounded-full px-1 bg-white shadow-sm" style={{ color: colors.primary }}>
              {cartCount}
            </span>
          )}
        </button>
      )}

      {/* ─── Main Content ────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Search */}
        {showSearchBar && (
          <div className="mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full h-10 pl-9 pr-8 ${btnRadius} border text-sm focus:outline-none focus:ring-2 focus:border-transparent`}
                style={{
                  backgroundColor: cardColors.surfaceElevated,
                  borderColor: cardColors.border,
                  color: cardColors.text,
                  ['--tw-ring-color' as string]: colors.primary,
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        {renderCategories()}

        {/* Results count */}
        {(search || activeCategory !== 'all') && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-sm mt-2 underline" style={{ color: colors.primary }}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className={getGridClass()}>
            {filteredProducts.map((product) => renderProductCard(product))}
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t mt-16 py-8 px-4" style={{ borderColor: bottomCardColors.border }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs" style={{ color: bottomCardColors.muted }}>
            {branding?.footerText || `© ${new Date().getFullYear()} ${tenant.name}`}
          </p>
          <p className="text-[10px] mt-2" style={{ color: gradientBottomDark || darkBg ? '#475569' : '#cbd5e1' }}>
            Creado con{' '}
            <a href="https://turnolink.com.ar/register" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
              TurnoLink Mercado
            </a>
          </p>
        </div>
      </footer>
      </div>{/* close relative content wrapper */}
      {/* Cart Drawer — rendered outside content wrapper for proper stacking */}
      <CartDrawer />
    </div>
  );
}
