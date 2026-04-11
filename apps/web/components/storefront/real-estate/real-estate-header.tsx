'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Menu, X, Home, Building, TrendingUp, Info, Instagram, Mail, ChevronRight, MapPin, ArrowUpRight, Heart } from 'lucide-react';
import type { TenantPublic } from '@/lib/api';
import { normalizePhoneForWhatsApp } from '@/lib/property-utils';
import { useFavorites } from '@/lib/hooks/use-favorites';

interface RealEstateHeaderProps {
  tenant: TenantPublic;
  slug: string;
  primaryColor: string;
  transparent?: boolean;
  onNavigate?: (section: string) => void;
  hasDevelopments?: boolean;
  branding?: any;
}

export function RealEstateHeader({ tenant, slug, primaryColor, transparent = false, onNavigate, hasDevelopments = false, branding }: RealEstateHeaderProps) {
  const whatsappNumber = tenant.phone ? normalizePhoneForWhatsApp(tenant.phone) : '';
  const settings = tenant.settings as any;
  const logoScale = Math.max(30, Math.min(300, settings?.logoScale ?? 100));
  const factor = logoScale / 100;
  // Página pública uses only settings.logoScale (Apariencia Web), NOT branding zoom

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const favCount = favorites.length;

  useEffect(() => {
    if (!transparent) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  // Close menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const onScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  // Lock body scroll on mobile when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [menuOpen]);

  const handleNav = useCallback((section: string) => {
    setMenuOpen(false);
    onNavigate?.(section);
  }, [onNavigate]);

  const isTransparent = transparent && !scrolled;
  const textColor = isTransparent ? 'text-white' : 'text-gray-900';
  const subtleColor = isTransparent ? 'text-white/60' : 'text-gray-400';
  const hoverBg = isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-50';

  const tasacionMsg = encodeURIComponent('Hola! Quiero tasar mi propiedad. ¿Podrían asesorarme?');
  const venderMsg = encodeURIComponent('Hola! Quiero vender mi propiedad. ¿Podrían asesorarme?');

  // Darken primary color for text use
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <>
      <header
        className="fixed z-40 top-0 inset-x-0 rounded-b-2xl transition-all duration-500"
        style={{
          background: isTransparent ? 'transparent' : 'rgba(255,255,255,0.75)',
          backdropFilter: isTransparent ? 'none' : 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(24px) saturate(140%)',
          boxShadow: isTransparent ? 'none' : '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
          borderBottom: isTransparent ? '1px solid transparent' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-[64px] md:h-[72px]">
            {/* Logo */}
            <a href={`/${slug}`} className="flex items-center shrink-0 overflow-hidden">
              {tenant.logo ? (
                <Image
                  src={tenant.logo}
                  alt={tenant.name}
                  width={Math.round(300 * factor)}
                  height={Math.round(80 * factor)}
                  className="object-contain transition-all duration-300"
                  unoptimized
                  style={{
                    height: `${Math.round(48 * factor)}px`,
                    width: 'auto',
                  }}
                  priority
                />
              ) : (
                <span className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${textColor}`} style={{ letterSpacing: '-0.03em' }}>
                  {tenant.name}
                </span>
              )}
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <button onClick={() => handleNav('Venta')} className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${subtleColor} ${hoverBg}`}>
                Comprar
              </button>
              <button onClick={() => handleNav('Alquiler')} className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${subtleColor} ${hoverBg}`}>
                Alquilar
              </button>
              {hasDevelopments && (
                <button onClick={() => handleNav('Desarrollo')} className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${subtleColor} ${hoverBg}`}>
                  Desarrollos
                </button>
              )}
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}?text=${tasacionMsg}`} target="_blank" rel="noopener noreferrer"
                  className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${subtleColor} ${hoverBg}`}>
                  Tasaciones
                </a>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-full text-[13px] transition-all ${subtleColor} ${hoverBg}`}>
                  <Phone className="h-3.5 w-3.5" />
                  {tenant.phone}
                </a>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97] ${
                    isTransparent
                      ? 'bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/20'
                      : 'text-white hover:brightness-110 hover:shadow-lg'
                  }`}
                  style={isTransparent ? {} : { backgroundColor: primaryColor }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Contactanos
                </a>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  menuOpen
                    ? 'bg-gray-900 text-white'
                    : `${subtleColor} ${hoverBg}`
                }`}
                aria-label="Menú"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                {!menuOpen && favCount > 0 && (
                  <span
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ PREMIUM DROPDOWN MENU ═══ */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[6px] md:bg-black/10 md:backdrop-blur-[2px] transition-all duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu panel */}
          <div
            className="fixed top-[64px] md:top-[72px] right-3 md:right-8 z-50 w-[calc(100vw-24px)] sm:w-[380px] animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(24px) saturate(140%)',
                WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              {/* ── Brand header with close button ── */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-600 transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {tenant.logo ? (
                    <Image
                      src={tenant.logo}
                      alt={tenant.name}
                      width={120}
                      height={32}
                      className="object-contain h-7 w-auto"
                      unoptimized
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                      {tenant.name}
                    </span>
                  )}
                </div>
                {(tenant as any).address && (
                  <p className="text-[11px] text-gray-600 mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {(tenant as any).address}
                  </p>
                )}
              </div>

              {/* ── Explore section ── */}
              <div className="px-3 pb-1">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.08em] px-2 mb-1">Explorar</p>
                <div className="space-y-0.5">
                  <NavItem
                    icon={<Home className="h-[18px] w-[18px]" />}
                    label="Propiedades en venta"
                    subtitle="Casas, departamentos, terrenos"
                    accentColor={primaryColor}
                    onClick={() => handleNav('Venta')}
                  />
                  <NavItem
                    icon={<Building className="h-[18px] w-[18px]" />}
                    label="Propiedades en alquiler"
                    subtitle="Alquileres disponibles"
                    accentColor={primaryColor}
                    onClick={() => handleNav('Alquiler')}
                  />
                  {hasDevelopments && (
                    <NavItem
                      icon={<Building className="h-[18px] w-[18px]" />}
                      label="Desarrollos"
                      subtitle="Proyectos inmobiliarios"
                      accentColor={primaryColor}
                      onClick={() => handleNav('Desarrollo')}
                    />
                  )}
                  <NavItem
                    icon={<Heart className="h-[18px] w-[18px]" fill={favCount > 0 ? 'currentColor' : 'none'} />}
                    label="Mis favoritos"
                    subtitle={favCount === 0 ? 'Guardá propiedades que te interesen' : `${favCount} propiedad${favCount !== 1 ? 'es' : ''} guardada${favCount !== 1 ? 's' : ''}`}
                    accentColor={primaryColor}
                    badge={favCount > 0 ? favCount : undefined}
                    onClick={() => handleNav('favorites')}
                  />
                  <NavItem
                    icon={<Info className="h-[18px] w-[18px]" />}
                    label="Sobre nosotros"
                    subtitle="Quiénes somos"
                    accentColor={primaryColor}
                    onClick={() => handleNav('about')}
                  />
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-5 my-2 h-px bg-black/10" />

              {/* ── Services section ── */}
              {whatsappNumber && (
                <>
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.08em] px-2 mb-1">Servicios</p>
                    <div className="space-y-0.5">
                      <a href={`https://wa.me/${whatsappNumber}?text=${tasacionMsg}`} target="_blank" rel="noopener noreferrer">
                        <ServiceItem
                          icon={<TrendingUp className="h-4 w-4" />}
                          label="Tasá tu propiedad"
                          badge="Gratis"
                          badgeColor="bg-emerald-50 text-emerald-600"
                          iconBg="bg-emerald-50 text-emerald-600"
                        />
                      </a>
                      <a href={`https://wa.me/${whatsappNumber}?text=${venderMsg}`} target="_blank" rel="noopener noreferrer">
                        <ServiceItem
                          icon={<Home className="h-4 w-4" />}
                          label="Vendé con nosotros"
                          badge="Asesoramiento"
                          badgeColor="bg-violet-50 text-violet-600"
                          iconBg="bg-violet-50 text-violet-600"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="mx-5 my-2 h-px bg-black/10" />
                </>
              )}

              {/* ── Contact section ── */}
              <div className="px-5 pt-2 pb-4">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.08em] mb-3">Contacto</p>

                {/* Contact pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tenant.phone && (
                    <a href={`tel:${tenant.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 bg-white/50 hover:bg-white/70 transition-colors border border-gray-200">
                      <Phone className="h-3 w-3" /> {tenant.phone}
                    </a>
                  )}
                  {(tenant as any).email && (
                    <a href={`mailto:${(tenant as any).email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 bg-white/50 hover:bg-white/70 transition-colors border border-gray-200">
                      <Mail className="h-3 w-3" /> Email
                    </a>
                  )}
                  {tenant.instagram && (
                    <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 bg-white/50 hover:bg-white/70 transition-colors border border-gray-200">
                      <Instagram className="h-3 w-3" /> {tenant.instagram}
                    </a>
                  )}
                </div>

                {/* WhatsApp CTA */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank" rel="noopener noreferrer"
                    className="group w-full inline-flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 4px 14px ${primaryRgb ? `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.3)` : 'rgba(0,0,0,0.15)'}`
                    }}
                  >
                    <MessageCircle className="h-[18px] w-[18px]" />
                    Escribinos por WhatsApp
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer */}
      {!transparent && <div className="h-[64px] md:h-[72px]" />}
    </>
  );
}

/* ── Nav Item ── */
function NavItem({ icon, label, subtitle, accentColor, onClick, badge }: {
  icon: React.ReactNode; label: string; subtitle: string; accentColor: string; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-white/40 transition-all text-left"
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{
          backgroundColor: `${accentColor}08`,
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{subtitle}</p>
      </div>
      {badge !== undefined && badge > 0 && (
        <span
          className="h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

/* ── Service Item ── */
function ServiceItem({ icon, label, badge, badgeColor, iconBg }: {
  icon: React.ReactNode; label: string; badge: string; badgeColor: string; iconBg: string;
}) {
  return (
    <div className="group flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-white/40 transition-all cursor-pointer">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 leading-tight">{label}</p>
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}

/* ── Hex to RGB helper ── */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : null;
}
