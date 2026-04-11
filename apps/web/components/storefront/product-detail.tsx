'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  Package,
  Search,
  Menu,
  Plus,
  Minus,
  Trash2,
  Check,
} from 'lucide-react';
import type { TenantPublic, Product, TenantBranding, ProductImage, ProductAttribute } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { BackgroundEffectLayer } from './background-effects';
import { AnnouncementBar } from './announcement-bar';
import { useCartStore } from '@/lib/cart-store';
import { usePublicTheme } from '@/components/booking/public-theme-wrapper';

interface ProductDetailProps {
  tenant: TenantPublic;
  slug: string;
  product: Product;
  branding: TenantBranding | null;
  relatedProducts: Product[];
}

export function ProductDetail({
  tenant,
  slug,
  product,
  branding,
  relatedProducts,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);

  // Get theme from PublicThemeWrapper — same system as catalog page
  const { theme: publicTheme } = usePublicTheme();
  const prefersDark = publicTheme === 'dark';

  // Cart store
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addItem);
  const removeFromCart = useCartStore((s) => s.removeItem);
  const updateCartQty = useCartStore((s) => s.updateQuantity);
  const cartCount = useCartStore((s) => s.getCount());
  const cartTotal = useCartStore((s) => s.getTotal());

  useEffect(() => { setCartMounted(true); }, []);

  const settings = tenant.settings as any;
  const storeType = settings?.storeType || 'catalogo';

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Branding ────────────────────────────────────────────
  // Color priority: match catalog page — settings > branding > fallback
  // PublicCatalogPage uses settings?.primaryColor || '#6366F1' for the theme wrapper.
  // Product detail must use the same source to ensure visual consistency.
  const isCatalog = storeType !== 'ecommerce';
  const useDarkMode = prefersDark && isCatalog;
  const colors = {
    primary: settings?.primaryColor || branding?.primaryColor || '#6366F1',
    secondary: settings?.secondaryColor || branding?.secondaryColor || '#8B5CF6',
    accent: settings?.accentColor || branding?.accentColor || '#10B981',
    bg: useDarkMode ? '#0a0a0a' : (branding?.backgroundColor || '#FFFFFF'),
    text: useDarkMode ? '#f1f5f9' : (branding?.textColor || '#1F2937'),
  };

  // ─── Card border radius — match storefront ───
  const BORDER_RADIUS_MAP: Record<string, string> = {
    sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem',
  };
  const configuredRadius = branding?.cardBorderRadius || 'lg';
  const brandingCardRadius = BORDER_RADIUS_MAP[configuredRadius] || '0.75rem';

  // ─── Image aspect ratio — match storefront ───
  const ASPECT_MAP: Record<string, string> = {
    square: 'aspect-square', portrait: 'aspect-[3/4]', landscape: 'aspect-[4/3]',
  };
  const configuredAspect = branding?.imageAspectRatio || 'square';
  const imageAspectClass = ASPECT_MAP[configuredAspect] || 'aspect-square';

  const isDark = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };

  const darkBg = isDark(colors.bg);

  // ─── Contrast-aware CTA color ───
  // When the primary color has poor contrast against the background (e.g. black on black),
  // compute an accessible alternative for buttons/CTAs.
  const getContrastRatio = (hex1: string, hex2: string): number => {
    const lum = (hex: string) => {
      const c = hex.replace('#', '');
      const srgb = [
        parseInt(c.substring(0, 2), 16) / 255,
        parseInt(c.substring(2, 4), 16) / 255,
        parseInt(c.substring(4, 6), 16) / 255,
      ].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    };
    const l1 = lum(hex1), l2 = lum(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // If primary has poor contrast (<3:1) against bg, use white for dark bgs or a lighter variant
  const primaryContrast = getContrastRatio(colors.primary, colors.bg);
  const ctaColor = primaryContrast >= 3
    ? colors.primary
    : darkBg ? '#ffffff' : '#111827';
  // Text color ON the CTA button
  const ctaTextColor = isDark(ctaColor) ? '#ffffff' : '#111827';

  const shiftColor = (hex: string, amount: number): string => {
    const c = hex.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(c.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(c.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(c.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const cardColors = {
    surface: darkBg ? shiftColor(colors.bg, 12) : '#ffffff',
    surfaceElevated: darkBg ? shiftColor(colors.bg, 22) : '#ffffff',
    text: darkBg ? '#f1f5f9' : colors.text,
    muted: darkBg ? '#94a3b8' : '#64748b',
    border: darkBg ? shiftColor(colors.bg, 35) : '#f1f5f9',
    hoverBorder: darkBg ? shiftColor(colors.bg, 55) : '#e2e8f0',
    placeholder: darkBg ? shiftColor(colors.bg, 18) : '#f1f5f9',
    shadow: darkBg ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.04)',
    shadowHover: darkBg ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.08)',
  };

  // Build card colors for the gradient bottom zone (always dark when gradient is on with dark target)
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

  const showPrices = branding?.showPrices ?? tenant.settings.showPrices ?? true;
  const showStock = branding?.showStock ?? false;
  const whatsappNumber = tenant.phone?.replace(/\D/g, '') || '';
  const headingFont = branding?.headingFontFamily || undefined;
  const bodyFont = branding?.fontFamily || undefined;
  const isEcommerce = storeType === 'ecommerce';
  const buttonStyle = branding?.buttonStyle || 'pill';
  const logoUrl = branding?.logoUrl || tenant.logo;
  const storeName = branding?.welcomeTitle || tenant.name;
  const profilePhotoStyle = branding?.profilePhotoStyle || 'round';
  const logoScale = branding?.logoScale ?? 1.0;
  const logoOffsetX = branding?.logoOffsetX ?? 0;
  const logoOffsetY = branding?.logoOffsetY ?? 0;

  // ─── Card Style — respect the owner's configured style ───
  // Ecommerce uses branding.storeCardStyle; catalog uses settings.cardStyle
  const catalogStyle = settings?.cardStyle || settings?.heroStyle || 'classic';
  const ecommerceStyle = branding?.storeCardStyle || 'standard';

  // Map catalog styles to consistent visual properties for this page
  const catalogStyleMap: Record<string, { containerRadius: string; imageRadius: string; headingWeight: string; headingTracking: string; headingTransform: string; priceWeight: string; relatedCardRadius: string }> = {
        classic: {
          containerRadius: '1rem',
          imageRadius: '1rem',
          headingWeight: 'font-bold',
          headingTracking: '',
          headingTransform: '',
          priceWeight: 'font-extrabold',
          relatedCardRadius: '1rem',
        },
        bold: {
          containerRadius: '0.25rem',
          imageRadius: '0.25rem',
          headingWeight: 'font-black',
          headingTracking: 'tracking-wide',
          headingTransform: 'uppercase',
          priceWeight: 'font-black',
          relatedCardRadius: '0.25rem',
        },
        zen: {
          containerRadius: '1.5rem',
          imageRadius: '1.5rem',
          headingWeight: 'font-light',
          headingTracking: 'tracking-wide',
          headingTransform: '',
          priceWeight: 'font-semibold',
          relatedCardRadius: '1.5rem',
        },
        energetic: {
          containerRadius: '0.75rem',
          imageRadius: '0.75rem',
          headingWeight: 'font-extrabold',
          headingTracking: '',
          headingTransform: '',
          priceWeight: 'font-extrabold',
          relatedCardRadius: '0.75rem',
        },
        warm: {
          containerRadius: '1rem',
          imageRadius: '1rem',
          headingWeight: 'font-semibold',
          headingTracking: '',
          headingTransform: '',
          priceWeight: 'font-bold',
          relatedCardRadius: '1rem',
        },
        corporate: {
          containerRadius: '0.375rem',
          imageRadius: '0.375rem',
          headingWeight: 'font-semibold',
          headingTracking: 'tracking-wide',
          headingTransform: 'uppercase',
          priceWeight: 'font-bold',
          relatedCardRadius: '0.375rem',
        },
        minimalist: {
          containerRadius: '0.75rem',
          imageRadius: '0.75rem',
          headingWeight: 'font-normal',
          headingTracking: '',
          headingTransform: '',
          priceWeight: 'font-semibold',
          relatedCardRadius: '0.75rem',
        },
        clinical: {
          containerRadius: '0.5rem',
          imageRadius: '0.5rem',
          headingWeight: 'font-medium',
          headingTracking: 'tracking-wide',
          headingTransform: '',
          priceWeight: 'font-semibold',
          relatedCardRadius: '0.5rem',
        },
  };
  const defaultStyle = {
    containerRadius: '1rem',
    imageRadius: '1rem',
    headingWeight: 'font-bold',
    headingTracking: '',
    headingTransform: '',
    priceWeight: 'font-extrabold',
    relatedCardRadius: '0.75rem',
  };
  // Use storeCardStyle for ecommerce, catalogStyle for catalog — respect owner's choice
  const ecommerceCardStyle = branding?.storeCardStyle || 'standard';
  const ecommerceStyleMap: Record<string, typeof defaultStyle> = {
    standard: defaultStyle,
    minimal: catalogStyleMap.minimalist || defaultStyle,
    compact: catalogStyleMap.bold || defaultStyle,
    editorial: catalogStyleMap.zen || defaultStyle,
    detailed: catalogStyleMap.corporate || defaultStyle,
    rounded: { ...defaultStyle, containerRadius: '1.5rem', imageRadius: '1.5rem', relatedCardRadius: '1.5rem' },
  };
  const styleProps = isEcommerce
    ? (ecommerceStyleMap[ecommerceCardStyle] || defaultStyle)
    : (catalogStyleMap[catalogStyle] || defaultStyle);

  // Override radii with branding's cardBorderRadius if configured
  if (branding?.cardBorderRadius) {
    styleProps.containerRadius = brandingCardRadius;
    styleProps.imageRadius = brandingCardRadius;
    styleProps.relatedCardRadius = brandingCardRadius;
  }

  // Announcement bar
  const announcementEnabled = branding?.announcementEnabled ?? false;
  const announcementText = branding?.announcementText || '';
  const announcementBgColor = branding?.announcementBgColor || '#000000';
  const announcementTextColor = branding?.announcementTextColor || '#FFFFFF';
  const announcementSpeed = (branding?.announcementSpeed as 'slow' | 'normal' | 'fast') || 'normal';

  // Background effects
  const bgEffect = branding?.backgroundEffect || 'none';
  const bgEffectColor = branding?.backgroundEffectColor || colors.primary;
  const bgEffectOpacity = branding?.backgroundEffectOpacity ?? 0.15;

  // Page gradient — multi-stop interpolation like checkout
  const gradientEnabled = branding?.gradientEnabled ?? false;
  const gradientStyle = branding?.gradientStyle || 'fade';
  const gradientFrom = branding?.gradientFrom || '#ffffff';
  const gradientTo = branding?.gradientTo || '#111827';

  const interpolateGradient = (from: string, to: string, stops: number[][]) => {
    const parse = (hex: string) => {
      const c = hex.replace('#', '');
      return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
    };
    const toHex = (r: number, g: number, b: number) =>
      `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    const [r1, g1, b1] = parse(from);
    const [r2, g2, b2] = parse(to);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const css = stops.map(([pct, t]) =>
      `${toHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t))} ${pct}%`
    ).join(', ');
    return `linear-gradient(180deg, ${css})`;
  };

  // Card colors for the bottom of the page when gradient is active
  const gradientBottomDark = gradientEnabled && isDark(gradientTo);
  const bottomCardColors = gradientBottomDark
    ? makeCardColors(gradientTo, true)
    : cardColors;



  // Button radius
  const BTN_STYLE_MAP: Record<string, string> = {
    pill: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-md',
    ghost: 'rounded-lg',
  };
  const btnRadius = BTN_STYLE_MAP[buttonStyle] || 'rounded-full';

  const images = (product.images || []).sort((a: ProductImage, b: ProductImage) => a.order - b.order);
  const currentImage = images[selectedImage]?.url || null;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.trackInventory && product.stock === 0;

  const activeVariant = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)
    : null;
  const displayPrice = activeVariant?.price ?? product.price;

  const getWhatsAppLink = () => {
    let msg = `Hola! Me interesa "${product.name}"`;
    if (activeVariant) msg += ` (${activeVariant.name}: ${activeVariant.value})`;
    if (showPrices) msg += ` — ${formatPrice(displayPrice)}`;
    msg += '. ¿Está disponible?';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: product.shortDescription || product.name, url }); return; } catch { /* ignored */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const prevImage = () => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  const nextImage = () => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));

  const getPrimaryImage = (p: Product): string | null => {
    if (!p.images || p.images.length === 0) return null;
    const primary = p.images.find((img: ProductImage) => img.isPrimary);
    return primary?.url || p.images[0]?.url || null;
  };

  const handleAddToCart = () => {
    const image = getPrimaryImage(product);
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      compareAtPrice: product.compareAtPrice,
      image,
      stock: product.stock,
      trackInventory: product.trackInventory,
    }, slug);
  };

  return (
    <div id="product-detail-root" className="relative min-h-screen" style={{
      overflowX: 'hidden',
      maxWidth: '100vw',
      overflowWrap: 'anywhere' as any,
      wordBreak: 'break-word' as any,
      backgroundColor: colors.bg,
      fontFamily: bodyFont,
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
              const navDark = darkBg ? shiftColor(colors.bg, 8) : (colors.secondary || '#111827');
              const [rD, gD, bD] = parse(navDark);
              const [rL, gL, bL] = parse(gradientFrom);
              const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
              const mix = (t: number) => toHex(lerp(rD, rL, t), lerp(gD, gL, t), lerp(bD, bL, t));
              const stops = [
                `${mix(0)} 0%`, `${mix(0)} 6%`, `${mix(0.15)} 10%`, `${mix(0.4)} 15%`,
                `${mix(0.7)} 20%`, `${mix(0.9)} 26%`, `${mix(1)} 32%`,
                `${mix(1)} 42%`, `${mix(1)} 50%`,
                `${mix(0.95)} 58%`, `${mix(0.85)} 65%`, `${mix(0.65)} 72%`,
                `${mix(0.45)} 80%`, `${mix(0.2)} 88%`, `${mix(0.05)} 95%`, `${mix(0)} 100%`,
              ];
              return `linear-gradient(180deg, ${stops.join(', ')})`;
            })()
          : interpolateGradient(gradientFrom, gradientTo, [
              [0, 0], [15, 0], [20, 0.05], [26, 0.12], [33, 0.22],
              [40, 0.35], [48, 0.5], [55, 0.62], [62, 0.74], [70, 0.84],
              [78, 0.91], [85, 0.95], [92, 0.98], [100, 1],
            ]),
      } : {}),
    }}>
      {/* Background Effects */}
      <BackgroundEffectLayer effect={bgEffect} color={bgEffectColor} opacity={bgEffectOpacity} isDarkBg={darkBg} />

      {/* Content */}
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

        {/* ─── Header ─────────────────────────────────────── */}
        {isEcommerce ? (
          <header className="sticky top-0 z-30">
            <nav
              className="shadow-lg"
              style={{ backgroundColor: darkBg ? shiftColor(colors.bg, 8) : (colors.secondary || '#111827') }}
            >
              <div className="max-w-6xl mx-auto px-3 sm:px-4">
                <div className="flex items-center h-14 sm:h-[4.5rem]">
                  {/* Logo with profile frame */}
                  <Link href={`/${slug}`} className="shrink-0 mr-3 sm:mr-6 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                    {logoUrl ? (
                      <div
                        className={`relative overflow-hidden shrink-0 ${
                          profilePhotoStyle === 'round' ? 'rounded-full' :
                          profilePhotoStyle === 'square' ? 'rounded-xl' : ''
                        }`}
                        style={{
                          width: 40, height: 40,
                          border: profilePhotoStyle !== 'none' ? '2.5px solid rgba(255,255,255,0.3)' : 'none',
                          boxShadow: profilePhotoStyle !== 'none' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                        }}
                      >
                        <NextImage
                          src={logoUrl}
                          alt={storeName}
                          fill
                          className="object-cover"
                          sizes="40px"
                          style={(logoScale !== 1 || logoOffsetX !== 0 || logoOffsetY !== 0)
                            ? { transform: `scale(${logoScale})${logoOffsetX || logoOffsetY ? ` translate(${logoOffsetX}%, ${logoOffsetY}%)` : ''}`, transformOrigin: 'center' }
                            : undefined}
                        />
                      </div>
                    ) : (
                      <span className="text-white text-lg sm:text-xl font-bold truncate max-w-[140px] block" style={{ fontFamily: headingFont }}>
                        {storeName}
                      </span>
                    )}
                  </Link>

                  <div className="flex-1" />

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={handleShare} className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${shareCopied ? 'text-emerald-400 bg-emerald-500/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title={shareCopied ? 'Link copiado!' : 'Compartir'}>
                      {shareCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    </button>
                    {whatsappNumber && (
                      <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                        className="h-9 w-9 rounded-lg flex items-center justify-center bg-green-500/80 hover:bg-green-500 text-white transition-all"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => setCartOpen(true)} className="relative h-9 w-9 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all">
                      <ShoppingCart className="h-4 w-4" />
                      {cartMounted && cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1" style={{ backgroundColor: 'white', color: colors.primary }}>
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </header>
        ) : (
          <header className="sticky top-0 z-30 backdrop-blur-xl shadow-sm" style={{
            backgroundColor: darkBg ? `${shiftColor(colors.bg, 8)}ee` : `${colors.bg}f0`,
            borderBottom: `1px solid ${cardColors.border}`,
          }}>
            <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
              <Link href={`/${slug}`} className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: cardColors.muted }}>
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Link>
              <div className="flex-1 text-center">
                <span className="text-sm font-semibold truncate" style={{ color: cardColors.text, fontFamily: headingFont }}>{storeName}</span>
              </div>
              <button onClick={handleShare} className="h-9 w-9 rounded-full flex items-center justify-center transition-all" style={{ color: shareCopied ? colors.accent : cardColors.muted }} title={shareCopied ? 'Link copiado!' : 'Compartir'}>
                {shareCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>
          </header>
        )}

        {/* ─── Main Content ────────────────────────────────── */}
        <main className={`max-w-6xl mx-auto py-4 sm:py-6 lg:py-10 ${gradientEnabled && gradientStyle === 'immersive' ? 'px-3 sm:px-6 lg:px-8' : 'px-3 sm:px-4'}`}>
          <div
            className={`grid gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-12 ${gradientEnabled && gradientStyle === 'immersive' ? 'p-3 sm:p-6 lg:p-8' : ''}`}
            style={{
              ...(gradientEnabled && gradientStyle === 'immersive' ? {
                backgroundColor: cardColors.surface,
                borderRadius: styleProps.containerRadius,
                border: `1px solid ${darkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
              } : {}),
            }}
          >
            {/* ─── Image Gallery ───────────────────────────── */}
            <div className="min-w-0">
              <div className="relative aspect-square overflow-hidden" style={{
                borderRadius: styleProps.imageRadius,
                backgroundColor: cardColors.placeholder,
                boxShadow: cardColors.shadowHover,
              }}>
                {currentImage ? (
                  <NextImage
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16" style={{ color: cardColors.border }} />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-all">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: colors.primary }}>
                      <Star className="h-3 w-3 fill-current" />
                      Destacado
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                      -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                    </span>
                  )}
                </div>

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img: ProductImage, idx: number) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden transition-all duration-200"
                      style={{
                        borderRadius: styleProps.relatedCardRadius,
                        border: `2.5px solid ${idx === selectedImage ? colors.primary : cardColors.border}`,
                        opacity: idx === selectedImage ? 1 : 0.6,
                      }}
                    >
                      <NextImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Product Info ────────────────────────────── */}
            <div className="min-w-0">
              {/* Category */}
              {product.category && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
                  {product.category.name}
                </p>
              )}

              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl ${styleProps.headingWeight} ${styleProps.headingTracking} leading-tight ${styleProps.headingTransform}`} style={{ color: cardColors.text, fontFamily: headingFont, overflowWrap: 'anywhere' }}>
                {product.name}
              </h1>

              {/* Price */}
              {showPrices && (
                <div className="flex items-baseline gap-3 mt-4">
                  <span className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl ${styleProps.priceWeight}`} style={{ color: cardColors.text }}>
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && !activeVariant && (
                    <span className="text-lg line-through" style={{ color: cardColors.muted }}>
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                </div>
              )}

              {/* Stock */}
              {showStock && product.trackInventory && (
                <p className={`text-sm mt-2 font-medium ${isOutOfStock ? 'text-red-500' : product.stock <= product.lowStockThreshold ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isOutOfStock
                    ? 'Sin stock'
                    : product.stock <= product.lowStockThreshold
                      ? `Últimas ${product.stock} unidades`
                      : 'En stock'}
                </p>
              )}
              {!product.trackInventory && (
                <p className="text-sm mt-2 font-medium text-emerald-500">Disponible</p>
              )}

              {/* SKU */}
              {product.sku && (
                <p className="text-xs mt-1" style={{ color: cardColors.muted }}>SKU: {product.sku}</p>
              )}

              {/* Short description */}
              {product.shortDescription && (
                <p className="mt-4 text-sm leading-relaxed" style={{ color: cardColors.muted }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Ficha Técnica / Características — premium mini cards */}
              {product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0 && (() => {
                const attrs = product.attributes as ProductAttribute[];
                const getVal = (key: string) => attrs.find(a => a.key === key)?.value;
                const operacion = getVal('operacion');
                const tipo = getVal('tipo_propiedad');
                const heroKeys = ['m2_totales', 'ambientes', 'banos', 'dormitorios', 'cochera'];
                const heroAttrs = heroKeys.map(k => attrs.find(a => a.key === k)).filter((a): a is ProductAttribute => !!a && !!a.value);
                const amenities = getVal('amenities')?.split(',').filter(Boolean) || [];
                const booleans = attrs.filter(a => a.type === 'boolean' && a.value === 'true');
                const detailKeys = new Set([...heroKeys, 'operacion', 'tipo_propiedad', 'amenities', ...attrs.filter(a => a.type === 'boolean').map(a => a.key)]);
                const detailAttrs = attrs.filter(a => !detailKeys.has(a.key) && a.value);
                const heroIcons: Record<string, string> = { m2_totales: '📐', ambientes: '🏠', banos: '🚿', dormitorios: '🛏️', cochera: '🚗' };
                return (
                  <div className="mt-5 pt-4 space-y-3" style={{ borderTop: `1px solid ${cardColors.border}` }}>
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
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: `${cardColors.border}30`, color: cardColors.text }}>
                            {tipo}
                          </span>
                        )}
                      </div>
                    )}
                    {heroAttrs.length > 0 && (
                      <div className={`grid gap-2 ${heroAttrs.length <= 2 ? 'grid-cols-2' : heroAttrs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                        {heroAttrs.map(attr => (
                          <div key={attr.key} className="flex flex-col items-center justify-center p-3 rounded-xl" style={{ backgroundColor: `${cardColors.border}15`, border: `1px solid ${cardColors.border}30` }}>
                            <span className="text-lg mb-0.5">{heroIcons[attr.key] || '📊'}</span>
                            <span className="text-base font-bold leading-tight" style={{ color: cardColors.text }}>
                              {attr.value}{attr.unit && <span className="text-xs font-normal ml-0.5" style={{ color: cardColors.muted }}>{attr.unit}</span>}
                            </span>
                            <span className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: cardColors.muted }}>{attr.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {detailAttrs.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {detailAttrs.map(attr => (
                          <div key={attr.key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${cardColors.border}10` }}>
                            <span className="text-[10px] uppercase tracking-wider min-w-0 shrink-0" style={{ color: cardColors.muted }}>{attr.label}</span>
                            <span className="text-xs font-semibold ml-auto text-right truncate" style={{ color: cardColors.text }}>
                              {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {amenities.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: cardColors.muted }}>Amenities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {amenities.map(a => (
                            <span key={a} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
                              {a.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {booleans.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {booleans.map(attr => (
                          <span key={attr.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                            ✓ {attr.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Divider */}
              <div className="my-6" style={{ borderTop: `1px solid ${cardColors.border}` }} />

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3" style={{ color: cardColors.text }}>
                    Opciones disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants
                      .filter((v) => v.isActive)
                      .map((v) => {
                        const variantOutOfStock = product.trackInventory && v.stock === 0;
                        const isSelected = selectedVariant === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(isSelected ? null : v.id)}
                            disabled={variantOutOfStock}
                            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${btnRadius}`}
                            style={{
                              backgroundColor: isSelected ? colors.primary : cardColors.surface,
                              color: isSelected ? '#ffffff' : variantOutOfStock ? cardColors.muted : cardColors.text,
                              border: `1.5px solid ${isSelected ? colors.primary : cardColors.border}`,
                              opacity: variantOutOfStock ? 0.4 : 1,
                              cursor: variantOutOfStock ? 'not-allowed' : 'pointer',
                              textDecoration: variantOutOfStock ? 'line-through' : 'none',
                            }}
                          >
                            {v.name}: {v.value}
                            {v.price && showPrices && v.price !== product.price && (
                              <span className="ml-1.5 text-xs opacity-75">({formatPrice(v.price)})</span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {isEcommerce && !isOutOfStock && (
                  <button
                    onClick={() => { handleAddToCart(); setCartOpen(true); }}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 font-semibold text-sm sm:text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${btnRadius}`}
                    style={{ backgroundColor: ctaColor, color: ctaTextColor, maxWidth: '100%', boxSizing: 'border-box' }}
                  >
                    <ShoppingCart className="h-5 w-5 shrink-0" />
                    <span>Agregar al carrito</span>
                  </button>
                )}

                {whatsappNumber && !isOutOfStock && (
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] text-sm sm:text-base ${btnRadius}`}
                    style={{
                      backgroundColor: isEcommerce ? colors.accent : ctaColor,
                      color: isEcommerce ? '#ffffff' : ctaTextColor,
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                )}

                {isOutOfStock && (
                  <div className={`w-full text-center py-3.5 font-medium ${btnRadius}`} style={{
                    backgroundColor: cardColors.surface,
                    color: cardColors.muted,
                  }}>
                    Producto agotado
                  </div>
                )}
              </div>

              {/* Full description */}
              {product.description && (
                <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${cardColors.border}` }}>
                  <h2 className="font-bold text-base mb-4" style={{ color: cardColors.text, fontFamily: headingFont }}>
                    Descripción
                  </h2>
                  <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: cardColors.muted, fontFamily: bodyFont, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                    {product.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Related Products ──────────────────────────── */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8" style={{ borderTop: `1px solid ${bottomCardColors.border}` }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: bottomCardColors.text, fontFamily: headingFont }}>
                Productos relacionados
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                {relatedProducts.map((p) => {
                  const img = getPrimaryImage(p);
                  const pDiscount = p.compareAtPrice && p.compareAtPrice > p.price;
                  return (
                    <Link
                      key={p.id}
                      href={`/${slug}/producto/${p.slug}`}
                      className="group overflow-hidden transition-all duration-300"
                      style={{
                        borderRadius: styleProps.relatedCardRadius,
                        backgroundColor: bottomCardColors.surface,
                        border: `1px solid ${bottomCardColors.border}`,
                        boxShadow: bottomCardColors.shadow,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = bottomCardColors.shadowHover;
                        e.currentTarget.style.borderColor = bottomCardColors.hoverBorder;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = bottomCardColors.shadow;
                        e.currentTarget.style.borderColor = bottomCardColors.border;
                      }}
                    >
                      <div className={`relative ${imageAspectClass} overflow-hidden`} style={{ backgroundColor: bottomCardColors.placeholder }}>
                        {img ? (
                          <NextImage
                            src={img}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6" style={{ color: bottomCardColors.border }} />
                          </div>
                        )}
                        {pDiscount && (
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                            -{Math.round(((p.compareAtPrice! - p.price) / p.compareAtPrice!) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className={`${styleProps.headingWeight === 'font-black' ? 'font-bold' : styleProps.headingWeight === 'font-light' ? 'font-light' : 'font-medium'} text-sm line-clamp-2 ${styleProps.headingTracking}`} style={{ color: bottomCardColors.text, fontFamily: headingFont }}>
                          {p.name}
                        </h3>
                        {showPrices && (
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="font-bold text-sm" style={{ color: bottomCardColors.text }}>
                              {formatPrice(p.price)}
                            </p>
                            {pDiscount && (
                              <p className="text-xs line-through" style={{ color: bottomCardColors.muted }}>
                                {formatPrice(p.compareAtPrice!)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ─── Ver más productos ─────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-8 sm:mt-12 text-center">
          <Link
            href={`/${slug}`}
            className={`inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-sm sm:text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${btnRadius}`}
            style={{
              backgroundColor: 'transparent',
              color: ctaColor,
              border: `2px solid ${ctaColor}`,
            }}
          >
            <ShoppingBag className="h-5 w-5" />
            Ver más productos
          </Link>
        </div>

        {/* ─── Footer ──────────────────────────────────────── */}
        <footer className="border-t mt-8 sm:mt-12 lg:mt-16 py-6 sm:py-8 px-3 sm:px-4" style={{ borderColor: bottomCardColors.border }}>
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
      </div>

      {/* ─── Cart Drawer ─────────────────────────────────── */}
      {isEcommerce && (
        <>
          {cartOpen && <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" onClick={() => setCartOpen(false)} />}
          <div
            className="fixed top-0 right-0 h-full z-[61] flex flex-col shadow-2xl transition-transform duration-300"
            style={{
              width: 'min(400px, 90vw)',
              transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
              backgroundColor: cardColors.surface,
              borderLeft: `1px solid ${cardColors.border}`,
            }}
          >
            {/* Cart header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${cardColors.border}` }}>
              <h3 className="font-bold text-lg" style={{ color: cardColors.text, fontFamily: headingFont }}>
                Carrito {cartMounted && cartCount > 0 && `(${cartCount})`}
              </h3>
              <button onClick={() => setCartOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ color: cardColors.muted }}>
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(!cartMounted || cartItems.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: cardColors.muted }}>
                  <ShoppingCart className="h-12 w-12 opacity-30" />
                  <p className="text-sm">Tu carrito está vacío</p>
                  <button onClick={() => setCartOpen(false)} className={`px-5 py-2 text-sm font-medium text-white ${btnRadius}`} style={{ backgroundColor: colors.primary }}>
                    Seguir comprando
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: cardColors.surfaceElevated, border: `1px solid ${cardColors.border}` }}>
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: cardColors.placeholder }}>
                      {item.image ? (
                        <NextImage src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5" style={{ color: cardColors.border }} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: cardColors.text }}>{item.name}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: colors.primary }}>{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: cardColors.surface, border: `1px solid ${cardColors.border}`, color: cardColors.text }}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center" style={{ color: cardColors.text }}>{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: cardColors.surface, border: `1px solid ${cardColors.border}`, color: cardColors.text }}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto h-6 w-6 rounded-full flex items-center justify-center text-red-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            {cartMounted && cartItems.length > 0 && (
              <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${cardColors.border}` }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: cardColors.text }}>Subtotal</span>
                  <span className="text-xl font-bold" style={{ color: cardColors.text }}>{formatPrice(cartTotal)}</span>
                </div>
                <Link
                  href={`/${slug}/checkout`}
                  onClick={() => setCartOpen(false)}
                  className={`block w-full text-center py-3.5 text-white font-semibold transition-all hover:opacity-90 ${btnRadius}`}
                  style={{ backgroundColor: colors.primary }}
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
