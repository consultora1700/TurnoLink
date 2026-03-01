'use client';

import React from 'react';
import {
  MapPin,
  Phone,
  Instagram,
  Sparkles,
  Star,
  Users,
  Shield,
  Zap,
  Heart,
  Check,
  Clock,
  Award,
  Activity,
  Flame,
  Leaf,
  Briefcase,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HeroStyleName } from '@/lib/hero-styles';
import { getContrastTextColor } from '@/lib/color-contrast';
import { usePublicTheme } from './public-theme-wrapper';

interface Tenant {
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  city: string | null;
  instagram: string | null;
}

interface ReputationStats {
  averageRating: number;
  totalReviews: number;
  recentBookingsCount: number;
  recentBookingsText: string;
}

interface CoverSettings {
  showProfilePhoto?: boolean;
  coverOverlayColor?: string;
  coverOverlayOpacity?: number;
  coverFadeEnabled?: boolean;
  coverFadeColor?: string;
}

interface Props {
  tenant: Tenant;
  reputationStats: ReputationStats | null;
  heroStyle: HeroStyleName;
  coverSettings?: CoverSettings;
}

// ─── Shared tiny helpers ──────────────────────────────────────────────────────

function Logo({ tenant, size, radius, border, className, hidden }: {
  tenant: Tenant; size: string; radius: string; border: string; className?: string; hidden?: boolean;
}) {
  if (hidden) return null;
  if (tenant.logo) {
    return <img src={tenant.logo} alt={tenant.name} className={`${size} ${radius} object-cover ${border} shadow-xl shrink-0 ${className || ''}`} />;
  }
  return null;
}

function LogoFallback({ tenant, size, radius, gradient, textSize, border, className, hidden }: {
  tenant: Tenant; size: string; radius: string; gradient: string; textSize: string; border: string; className?: string; hidden?: boolean;
}) {
  if (hidden) return null;
  if (tenant.logo) return <Logo tenant={tenant} size={size} radius={radius} border={border} className={className} />;
  return (
    <div className={`${size} ${radius} ${gradient} flex items-center justify-center ${border} shadow-xl shrink-0 ${className || ''}`}>
      <span className={`${textSize} font-bold text-white`}>{tenant.name.charAt(0)}</span>
    </div>
  );
}

/** Returns true if the tenant has explicitly configured cover overlay settings */
function hasCustomOverlay(cs?: CoverSettings): boolean {
  return cs?.coverOverlayColor != null || cs?.coverOverlayOpacity != null;
}

function CoverOverlay({ coverSettings }: { coverSettings?: CoverSettings }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: coverSettings?.coverOverlayColor || '#000000',
        opacity: (coverSettings?.coverOverlayOpacity ?? 60) / 100,
      }}
    />
  );
}

function CoverFade({ coverSettings }: { coverSettings?: CoverSettings }) {
  if (!coverSettings?.coverFadeEnabled) return null;
  return (
    <div
      className="absolute inset-x-0 bottom-0 h-24"
      style={{
        background: `linear-gradient(to bottom, transparent, ${coverSettings.coverFadeColor || '#000000'})`,
      }}
    />
  );
}

function RatingLine({ stats, lightMode }: { stats: ReputationStats | null; lightMode?: boolean }) {
  const textA = lightMode ? 'text-slate-700' : 'text-white/90';
  const textB = lightMode ? 'text-slate-400' : 'text-white/60';
  const textC = lightMode ? 'text-slate-500' : 'text-white/85';
  const newColor = lightMode ? 'text-[hsl(var(--tenant-accent-600))]' : 'text-[hsl(var(--tenant-accent-300))]';

  if (stats?.totalReviews && stats.totalReviews > 0) {
    return (
      <div className="inline-flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-1 ${textA}`}>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
        </div>
        <span className={textB}>•</span>
        <span className={textC}>{stats.totalReviews} opiniones</span>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${newColor}`}>
      <Sparkles className="h-3 w-3" />
      <span className="font-medium">Nuevo en TurnoLink</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSIC — pink→fuchsia→violet gradient, sparkle badges, rounded pills
// ═══════════════════════════════════════════════════════════════════════════════
function ClassicHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const { heroContrastMode } = usePublicTheme();
  const hidelogo = coverSettings?.showProfilePhoto === false;
  // Cover image → dark overlay → always light text; no cover → dynamic contrast
  const isLT = tenant.coverImage ? true : heroContrastMode === 'light';
  const txt = isLT ? 'text-white' : 'text-slate-900';
  const txtM = isLT ? 'text-white/90' : 'text-slate-600';
  const txtF = isLT ? 'text-white/85' : 'text-slate-500';
  const txtD = isLT ? 'text-white/80' : 'text-slate-400';
  const pillCls = isLT ? 'bg-white/10 backdrop-blur' : 'bg-slate-100';
  const pillHover = isLT ? 'hover:bg-white/20' : 'hover:bg-slate-200';
  const borderCls = isLT ? 'border-white/10' : 'border-slate-200';
  const boxCls = isLT ? 'bg-white/10 backdrop-blur' : 'bg-white/80 border border-slate-200 shadow-sm';
  const badgeCls = isLT ? 'bg-white/10 text-white border-white/20' : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] via-[hsl(var(--tenant-primary-600))] to-[hsl(var(--tenant-secondary-600))]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </>
      )}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[hsl(var(--tenant-primary-300)_/_0.3)] rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[hsl(var(--tenant-secondary-300)_/_0.3)] rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]" textSize="text-xl" border="border-2 border-white/20" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className={`text-lg font-bold ${txt} truncate`}>{tenant.name}</h1>
                <Badge className="bg-[hsl(var(--tenant-accent-500)_/_0.2)] text-[hsl(var(--tenant-accent-200))] border-[hsl(var(--tenant-accent-400)_/_0.3)] text-[10px] px-1.5 py-0.5 shrink-0">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />Online
                </Badge>
              </div>
              <RatingLine stats={reputationStats} lightMode={!isLT} />
            </div>
          </div>
          {tenant.description && <p className={`${txtM} text-sm mb-4`}>{tenant.description}</p>}
          <div className="flex items-center justify-center gap-2">
            {tenant.city && (
              <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-1.5 ${pillCls} rounded-full px-3 py-1.5 ${txtM} text-sm ${pillHover}`}><MapPin className="h-4 w-4 text-[hsl(var(--tenant-secondary-300))]" />Dirección</button>
            )}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-1.5 ${pillCls} rounded-full px-3 py-1.5 ${txtM} text-sm ${pillHover}`}><Phone className="h-4 w-4 text-[hsl(var(--tenant-accent-300))]" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 ${pillCls} rounded-full px-3 py-1.5 ${txtM} text-sm ${pillHover}`}><Instagram className="h-4 w-4 text-[hsl(var(--tenant-primary-300))]" />Instagram</a>}
          </div>
          <div className={`flex items-center justify-center gap-4 mt-5 pt-4 border-t ${borderCls}`}>
            <div className={`flex items-center gap-1.5 ${txtF} text-xs`}><Zap className="h-4 w-4 text-[hsl(var(--tenant-secondary-300))]" /><span>Inmediato</span></div>
            <div className={`flex items-center gap-1.5 ${txtF} text-xs`}><Shield className="h-4 w-4 text-[hsl(var(--tenant-accent-300))]" /><span>Seguro</span></div>
            <div className={`flex items-center gap-1.5 ${txtF} text-xs`}><Heart className="h-4 w-4 text-[hsl(var(--tenant-primary-300))]" /><span>Garantizado</span></div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-2xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]" textSize="text-4xl lg:text-5xl" border="border-2 border-white/20" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-3">
                <h1 className={`text-3xl lg:text-4xl font-bold ${txt}`}>{tenant.name}</h1>
                <Badge className={`${badgeCls} text-sm px-3 py-1`}><Sparkles className="h-4 w-4 mr-1.5" />Online 24/7</Badge>
              </div>
              {tenant.description && <p className={`${txtM} text-base lg:text-lg max-w-2xl mb-4`}>{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txtM} ${pillHover} transition-colors cursor-pointer`}><MapPin className="h-5 w-5 text-[hsl(var(--tenant-secondary-300))]" />Dirección</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txtM} ${pillHover} transition-colors`}><Phone className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txtM} ${pillHover} transition-colors`}><Instagram className="h-5 w-5 text-[hsl(var(--tenant-primary-300))]" />Instagram</a>}
              </div>
            </div>
            {/* Stats */}
            <div className={`hidden lg:flex items-center gap-6 ${boxCls} rounded-2xl px-6 py-4`}>
              {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Star className="h-6 w-6 fill-amber-400 text-amber-400" /><span className={`text-3xl font-bold ${txt}`}>{reputationStats.averageRating.toFixed(1)}</span></div>
                    <span className={`text-sm ${txtD}`}>{reputationStats.totalReviews} opiniones</span>
                  </div>
                  <div className={`w-px h-12 ${isLT ? 'bg-white/20' : 'bg-slate-200'}`} />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Users className="h-6 w-6 text-[hsl(var(--tenant-secondary-300))]" /><span className={`text-3xl font-bold ${txt}`}>{reputationStats.recentBookingsCount >= 10 ? `${Math.floor(reputationStats.recentBookingsCount / 10) * 10}+` : reputationStats.recentBookingsCount.toString()}</span></div>
                    <span className={`text-sm ${txtD}`}>Esta semana</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 px-2"><div className="w-12 h-12 rounded-xl bg-[hsl(var(--tenant-accent-500)_/_0.2)] flex items-center justify-center"><Sparkles className="h-6 w-6 text-[hsl(var(--tenant-accent-300))]" /></div><div><span className={`text-lg font-bold ${txt}`}>Nuevo</span><p className={`text-sm ${txtD}`}>Recién llegamos</p></div></div>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-8 mt-6 pt-5 border-t ${borderCls}`}>
            <div className={`flex items-center gap-3 ${txtF}`}><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-secondary-500)_/_0.2)] flex items-center justify-center"><Zap className="h-5 w-5 text-[hsl(var(--tenant-secondary-300))]" /></div><span className="text-base">Confirmación Inmediata</span></div>
            <div className={`flex items-center gap-3 ${txtF}`}><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-accent-500)_/_0.2)] flex items-center justify-center"><Shield className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" /></div><span className="text-base">100% Seguro</span></div>
            <div className={`flex items-center gap-3 ${txtF}`}><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-primary-500)_/_0.2)] flex items-center justify-center"><Heart className="h-5 w-5 text-[hsl(var(--tenant-primary-300))]" /></div><span className="text-base">{reputationStats?.recentBookingsText || 'Reserva tu turno'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL — Fondo claro, linea lateral teal, iconos de verificación, sin decoraciones
// ═══════════════════════════════════════════════════════════════════════════════
function ClinicalHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const { theme } = usePublicTheme();
  const hidelogo = coverSettings?.showProfilePhoto === false;
  const hasCover = !!tenant.coverImage;
  const customOverlay = hasCover && hasCustomOverlay(coverSettings);

  // Determine if the effective visual background is light or dark.
  // Custom overlay → derive from overlay color (overrides system theme).
  // Otherwise → follow system theme.
  const isLightBg = customOverlay
    ? getContrastTextColor(coverSettings?.coverOverlayColor || '#ffffff') === 'dark'
    : theme === 'light';

  // Computed contrast-aware classes
  const txt = isLightBg ? 'text-slate-900' : 'text-white';
  const txtSub = isLightBg ? 'text-slate-600' : 'text-neutral-300';
  const txtMuted = isLightBg ? 'text-slate-500' : 'text-neutral-400';
  const borderC = isLightBg ? 'border-slate-200' : 'border-white/15';
  const dividerBg = isLightBg ? 'bg-slate-200' : 'bg-white/15';
  const linkC = isLightBg
    ? 'text-[hsl(var(--tenant-primary-700))]'
    : 'text-[hsl(var(--tenant-primary-300))]';
  const badgeCls = isLightBg
    ? 'bg-[hsl(var(--tenant-primary-100))] text-[hsl(var(--tenant-primary-700))] border-[hsl(var(--tenant-primary-200))]'
    : 'bg-[hsl(var(--tenant-primary-900)_/_0.4)] text-[hsl(var(--tenant-primary-300))] border-[hsl(var(--tenant-primary-800))]';
  const logoBorder = isLightBg
    ? 'border-[hsl(var(--tenant-primary-200))]'
    : 'border-[hsl(var(--tenant-primary-800))]';
  const ratingBox = isLightBg
    ? 'bg-white border-slate-200'
    : 'bg-white/5 border-white/10';
  const glowA = isLightBg ? 0.15 : 0.1;
  const glowB = isLightBg ? 0.1 : 0.08;

  return (
    <header className={`relative z-10 border-b ${borderC}`}>
      {hasCover ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {customOverlay ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-sm" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50 to-[hsl(var(--tenant-primary-50)_/_0.5)] dark:from-neutral-900 dark:via-neutral-900 dark:to-[hsl(var(--tenant-primary-950)_/_0.3)]" />
      )}
      {/* Subtle primary glow */}
      <div className="absolute -left-20 top-1/4 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: `hsl(var(--tenant-primary-500) / ${glowA})` }} />
      <div className="absolute -right-16 bottom-1/4 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: `hsl(var(--tenant-secondary-500) / ${glowB})` }} />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-lg" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-xl" border={`border-2 ${logoBorder}`} hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg font-bold truncate ${txt}`}>{tenant.name}</h1>
              <div className={`flex items-center gap-1.5 text-xs ${linkC} mt-0.5`}>
                <Check className="h-3 w-3" /><span>Centro verificado</span>
              </div>
            </div>
          </div>
          {tenant.description && <p className={`${txtSub} text-sm mb-4`}>{tenant.description}</p>}
          {/* Contact as simple text links */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-1.5 ${linkC} hover:underline`}><MapPin className="h-3.5 w-3.5" />Ver ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-1.5 ${linkC} hover:underline`}><Phone className="h-3.5 w-3.5" />{tenant.phone}</a>}
          </div>
          {/* Trust: evenly distributed with vertical separators */}
          <div className={`flex items-center mt-4 pt-3 border-t ${borderC} text-xs ${txtMuted}`}>
            <span className="flex-1 flex items-center justify-center gap-1"><Check className="h-3 w-3 text-[hsl(var(--tenant-primary-500))]" />Turnos online</span>
            <span className={`w-px h-3.5 ${dividerBg}`} />
            <span className="flex-1 flex items-center justify-center gap-1"><Check className="h-3 w-3 text-[hsl(var(--tenant-primary-500))]" />Conf. inmediata</span>
            <span className={`w-px h-3.5 ${dividerBg}`} />
            <span className="flex-1 flex items-center justify-center gap-1"><Check className="h-3 w-3 text-[hsl(var(--tenant-primary-500))]" />Seguro</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-2 lg:py-4">
          <div className="flex items-center gap-6">
            <LogoFallback tenant={tenant} size="w-20 h-20 lg:w-24 lg:h-24" radius="rounded-lg" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-3xl lg:text-4xl" border={`border-2 ${logoBorder}`} hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-2xl lg:text-3xl font-bold ${txt}`}>{tenant.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${badgeCls}`}>
                  <Check className="h-3 w-3" />Verificado
                </span>
              </div>
              {tenant.description && <p className={`${txtSub} text-sm lg:text-base max-w-xl mb-3`}>{tenant.description}</p>}
              <div className="flex items-center gap-4 text-sm">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-1.5 ${linkC} hover:underline cursor-pointer`}><MapPin className="h-4 w-4" />Ver ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-1.5 ${linkC} hover:underline`}><Phone className="h-4 w-4" />{tenant.phone}</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 ${linkC} hover:underline`}><Instagram className="h-4 w-4" />@{tenant.instagram.replace('@', '')}</a>}
              </div>
            </div>
            {/* Rating as clean number */}
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
              <div className={`hidden lg:block text-center border rounded-lg px-6 py-4 shadow-sm ${ratingBox}`}>
                <div className="flex items-center gap-1.5 mb-0.5"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className={`text-2xl font-bold ${txt}`}>{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className={`text-xs ${txtMuted}`}>{reputationStats.totalReviews} opiniones</span>
              </div>
            ) : null}
          </div>
          {/* Bottom trust row — evenly distributed with vertical separators */}
          <div className={`flex items-center mt-5 pt-4 border-t ${borderC} text-sm ${txtMuted}`}>
            <span className="flex-1 flex items-center justify-center gap-1.5"><Check className="h-4 w-4 text-[hsl(var(--tenant-primary-500))]" />Turnos online 24/7</span>
            <span className={`w-px h-4 ${dividerBg}`} />
            <span className="flex-1 flex items-center justify-center gap-1.5"><Check className="h-4 w-4 text-[hsl(var(--tenant-primary-500))]" />Confirmación inmediata</span>
            <span className={`w-px h-4 ${dividerBg}`} />
            <span className="flex-1 flex items-center justify-center gap-1.5"><Check className="h-4 w-4 text-[hsl(var(--tenant-primary-500))]" />Datos protegidos</span>
            {reputationStats?.recentBookingsText && (
              <>
                <span className={`w-px h-4 ${dividerBg}`} />
                <span className="flex-1 flex items-center justify-center gap-1.5"><Check className="h-4 w-4 text-[hsl(var(--tenant-primary-500))]" />{reputationStats.recentBookingsText}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOLD — Fondo oscuro, angular, patron geométrico, tipografia gruesa
// ═══════════════════════════════════════════════════════════════════════════════
function BoldHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const hidelogo = coverSettings?.showProfilePhoto === false;
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-black/75" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-zinc-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.06%27%20fill-rule=%27evenodd%27%3E%3Cpath%20d=%27M0%200h20v20H0V0zm20%2020h20v20H20V20z%27/%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[hsl(var(--tenant-primary-500)_/_0.1)] to-transparent skew-x-[-12deg] translate-x-20" />
        </>
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* ── Mobile ── */}
        <div className="md:hidden flex flex-col">
          {/* Row 1: Logo + Name + Rating */}
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-sm" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-600))]" textSize="text-xl" border="border-2 border-[hsl(var(--tenant-primary-500)_/_0.3)]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black tracking-tight text-white uppercase truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {/* Row 2: Description — always visible, no toggle to prevent layout shift */}
          {tenant.description && (
            <p className="text-white/80 text-xs leading-relaxed mb-3">{tenant.description}</p>
          )}
          {/* Row 3: Action buttons — grid cols-3 */}
          <div className="grid grid-cols-3 gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/90 text-xs hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors"><MapPin className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-400))]" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/90 text-xs hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors"><Phone className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-400))]" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/90 text-xs hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors"><Instagram className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-400))]" />Instagram</a>}
          </div>
          {/* Row 4: Trust badges — footer-like strip with dividers */}
          <div className="flex items-center mt-3 pt-2.5 border-t border-white/10">
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/60 uppercase tracking-wider"><Zap className="h-3 w-3 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Rápido</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/60 uppercase tracking-wider"><Shield className="h-3 w-3 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Seguro</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/60 uppercase tracking-wider"><Award className="h-3 w-3 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Premium</span>
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-center gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-sm" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-600))]" textSize="text-4xl lg:text-5xl" border="border-2 border-[hsl(var(--tenant-primary-500)_/_0.3)]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase mb-2">{tenant.name}</h1>
              {tenant.description && <p className="text-white/80 text-sm max-w-xl mb-3 line-clamp-2">{tenant.description}</p>}
              <div className="flex items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/90 text-sm hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors cursor-pointer"><MapPin className="h-4 w-4 text-[hsl(var(--tenant-primary-400))]" />Ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/90 text-sm hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors"><Phone className="h-4 w-4 text-[hsl(var(--tenant-primary-400))]" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/90 text-sm hover:bg-[hsl(var(--tenant-primary-500)_/_0.2)] transition-colors"><Instagram className="h-4 w-4 text-[hsl(var(--tenant-primary-400))]" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
              <div className="hidden lg:block bg-white/5 border border-white/10 rounded-sm px-6 py-4">
                <div className="flex items-center gap-2 mb-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="text-3xl font-black text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-xs text-white/70 uppercase tracking-wider">{reputationStats.totalReviews} opiniones</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Trust strip — full-width bar below hero content, desktop only */}
      <div className="hidden md:block relative border-t border-white/10">
        <div className="flex items-center">
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/60 uppercase tracking-wider"><Zap className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Rápido</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/60 uppercase tracking-wider"><Shield className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Seguro</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/60 uppercase tracking-wider"><Award className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-500)_/_0.6)]" />Premium</span>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZEN — Centrado, mucho espacio, tipografia liviana, onda organica SVG
// ═══════════════════════════════════════════════════════════════════════════════
function ZenHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const hidelogo = coverSettings?.showProfilePhoto === false;
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--tenant-primary-50))] via-[hsl(var(--tenant-secondary-50)_/_0.8)] to-white dark:from-[hsl(var(--tenant-primary-950)_/_0.4)] dark:via-[hsl(var(--tenant-secondary-950)_/_0.3)] dark:to-neutral-900" />
          {/* Organic wave SVG */}
          <svg className="absolute bottom-0 left-0 w-full h-16 text-white dark:text-neutral-900" viewBox="0 0 1440 64" preserveAspectRatio="none"><path fill="currentColor" d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,48 1440,32 L1440,64 L0,64 Z" /></svg>
        </>
      )}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-[hsl(var(--tenant-primary-200)_/_0.2)] dark:bg-[hsl(var(--tenant-primary-700)_/_0.1)] rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-[hsl(var(--tenant-secondary-200)_/_0.2)] dark:bg-[hsl(var(--tenant-secondary-700)_/_0.1)] rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
        {/* Mobile */}
        <div className="md:hidden">
          {!hidelogo && (
            <div className="flex justify-center mb-4">
              <LogoFallback tenant={tenant} size="w-20 h-20" radius="rounded-full" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-400))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-2xl" border="border-4 border-white dark:border-neutral-800 shadow-lg" />
            </div>
          )}
          <h1 className="text-xl font-medium tracking-wide text-slate-800 dark:text-white mb-2">{tenant.name}</h1>
          {tenant.description && <p className="text-slate-500 dark:text-neutral-400 text-sm max-w-xs mx-auto mb-5 leading-relaxed">{tenant.description}</p>}
          <RatingLine stats={reputationStats} lightMode />
          <div className="flex items-center justify-center gap-3 mt-5">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><MapPin className="h-4 w-4 text-[hsl(var(--tenant-primary-500))]" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Phone className="h-4 w-4 text-[hsl(var(--tenant-secondary-500))]" />Llamar</a>}
          </div>
          {/* Trust: minimal text with dots */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400 dark:text-neutral-500">
            <span>Reserva fácil</span><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" /><span>Conf. inmediata</span><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" /><span>Seguro</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          {!hidelogo && (
            <div className="flex justify-center mb-5">
              <LogoFallback tenant={tenant} size="w-28 h-28 lg:w-32 lg:h-32" radius="rounded-full" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-400))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-4xl lg:text-5xl" border="border-4 border-white dark:border-neutral-800 shadow-xl" />
            </div>
          )}
          <h1 className="text-3xl lg:text-4xl font-medium tracking-wide text-slate-800 dark:text-white mb-3">{tenant.name}</h1>
          {tenant.description && <p className="text-slate-500 dark:text-neutral-400 text-base lg:text-lg max-w-lg mx-auto mb-6 leading-relaxed">{tenant.description}</p>}
          <div className="flex items-center justify-center gap-4 mb-6">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow cursor-pointer"><MapPin className="h-5 w-5 text-[hsl(var(--tenant-primary-500))]" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Phone className="h-5 w-5 text-[hsl(var(--tenant-secondary-500))]" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Instagram className="h-5 w-5 text-[hsl(var(--tenant-accent-500))]" />Instagram</a>}
          </div>
          {/* Trust: spacious text separated by dots */}
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 dark:text-neutral-500">
            <span className="flex items-center gap-1.5"><Leaf className="h-4 w-4 text-[hsl(var(--tenant-primary-400))]" />Reserva fácil</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700" />
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[hsl(var(--tenant-secondary-400))]" />Confirmación inmediata</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700" />
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-[hsl(var(--tenant-accent-400))]" />100% seguro</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE — Compacto, side-by-side, sin decoraciones, tipografia seria
// ═══════════════════════════════════════════════════════════════════════════════
function CorporateHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const hidelogo = coverSettings?.showProfilePhoto === false;
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-12 h-12" radius="rounded-md" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-600))] to-[hsl(var(--tenant-secondary-600))]" textSize="text-lg" border="border border-white/20" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {tenant.description && <p className="text-white/80 text-sm mb-3 line-clamp-2">{tenant.description}</p>}
          <div className="flex items-center gap-2 text-xs">
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 bg-white/10 rounded-md px-2.5 py-1.5 text-white/85 hover:bg-white/20 transition-colors"><Phone className="h-3.5 w-3.5" />{tenant.phone}</a>}
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1 bg-white/10 rounded-md px-2.5 py-1.5 text-white/85 hover:bg-white/20 transition-colors"><MapPin className="h-3.5 w-3.5" />Ubicación</button>}
          </div>
        </div>

        {/* Desktop — compact single row */}
        <div className="hidden md:flex items-center gap-5">
          <LogoFallback tenant={tenant} size="w-16 h-16 lg:w-20 lg:h-20" radius="rounded-md" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-600))] to-[hsl(var(--tenant-secondary-600))]" textSize="text-2xl lg:text-3xl" border="border border-white/20" hidden={hidelogo} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">{tenant.name}</h1>
              <Briefcase className="h-4 w-4 text-[hsl(var(--tenant-primary-300))]" />
            </div>
            {tenant.description && <p className="text-white/80 text-sm max-w-lg truncate">{tenant.description}</p>}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/85 hover:bg-white/20 transition-colors"><Phone className="h-4 w-4" />{tenant.phone}</a>}
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/85 hover:bg-white/20 transition-colors cursor-pointer"><MapPin className="h-4 w-4" />Ubicación</button>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/85 hover:bg-white/20 transition-colors"><Globe className="h-4 w-4" />Web</a>}
          </div>
          {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
            <div className="hidden lg:flex items-center gap-2 bg-white/10 rounded-md px-4 py-2.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-white">{reputationStats.averageRating.toFixed(1)}</span>
              <span className="text-xs text-white/70">({reputationStats.totalReviews})</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGETIC — Gradiente diagonal, triangulos, tipografia bold, separadores
// ═══════════════════════════════════════════════════════════════════════════════
function EnergeticHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const { heroContrastMode } = usePublicTheme();
  const hidelogo = coverSettings?.showProfilePhoto === false;
  const isLT = tenant.coverImage ? true : heroContrastMode === 'light';
  const txt = isLT ? 'text-white' : 'text-slate-900';
  const txtM = isLT ? 'text-white/90' : 'text-slate-600';
  const txtF = isLT ? 'text-white/85' : 'text-slate-500';
  const pillCls = isLT ? 'bg-black/20 backdrop-blur' : 'bg-slate-100';
  const pillHover = isLT ? 'hover:bg-black/30' : 'hover:bg-slate-200';
  const borderCls = isLT ? 'border-white/20' : 'border-slate-200';
  const trustTxt = isLT ? 'text-white/90' : 'text-slate-700';
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tenant-secondary-600)_/_0.7)] via-[hsl(var(--tenant-primary-500)_/_0.6)] to-[hsl(var(--tenant-accent-500)_/_0.5)]" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tenant-secondary-600))] via-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-accent-500))]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.06%27%3E%3Cpolygon%20points=%2730%200%2060%2030%2030%2060%200%2030%27/%3E%3C/g%3E%3C/svg%3E')]" />
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[hsl(var(--tenant-accent-400)_/_0.5)] to-transparent" />
        </>
      )}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[hsl(var(--tenant-accent-300)_/_0.3)] rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]" textSize="text-xl" border="border-2 border-[hsl(var(--tenant-accent-400)_/_0.3)]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg font-black tracking-tight ${txt} truncate`}>{tenant.name}</h1>
              <RatingLine stats={reputationStats} lightMode={!isLT} />
            </div>
          </div>
          {tenant.description && <p className={`${txtM} text-sm mb-4 font-medium`}>{tenant.description}</p>}
          <div className="flex items-center gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-1.5 ${pillCls} rounded-full px-3 py-1.5 ${txt} text-sm font-semibold ${pillHover} transition-colors`}><MapPin className="h-4 w-4 text-[hsl(var(--tenant-accent-300))]" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-1.5 ${pillCls} rounded-full px-3 py-1.5 ${txt} text-sm font-semibold ${pillHover} transition-colors`}><Phone className="h-4 w-4 text-[hsl(var(--tenant-accent-300))]" />Llamar</a>}
          </div>
          {/* Trust: bold with vertical separators */}
          <div className={`flex items-center justify-center gap-3 mt-5 pt-4 border-t ${borderCls}`}>
            <span className={`text-xs font-bold ${trustTxt} flex items-center gap-1`}><Flame className="h-3.5 w-3.5 text-[hsl(var(--tenant-accent-300))]" />RÁPIDO</span>
            <span className={`w-px h-4 ${isLT ? 'bg-white/30' : 'bg-slate-300'}`} />
            <span className={`text-xs font-bold ${trustTxt} flex items-center gap-1`}><Shield className="h-3.5 w-3.5 text-[hsl(var(--tenant-accent-300))]" />SEGURO</span>
            <span className={`w-px h-4 ${isLT ? 'bg-white/30' : 'bg-slate-300'}`} />
            <span className={`text-xs font-bold ${trustTxt} flex items-center gap-1`}><Activity className="h-3.5 w-3.5 text-[hsl(var(--tenant-accent-300))]" />ACTIVO</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]" textSize="text-4xl lg:text-5xl" border="border-2 border-[hsl(var(--tenant-accent-400)_/_0.3)]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl lg:text-4xl font-black tracking-tight ${txt} mb-2`}>{tenant.name}</h1>
              {tenant.description && <p className={`${txtM} text-base lg:text-lg max-w-2xl mb-4 font-medium`}>{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txt} font-semibold ${pillHover} transition-colors cursor-pointer`}><MapPin className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" />Ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txt} font-semibold ${pillHover} transition-colors`}><Phone className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${pillCls} rounded-full px-4 py-2 ${txt} font-semibold ${pillHover} transition-colors`}><Instagram className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
              <div className={`hidden lg:block ${pillCls} rounded-2xl px-6 py-4 text-center`}>
                <div className="flex items-center gap-2 mb-1"><Star className="h-6 w-6 fill-amber-400 text-amber-400" /><span className={`text-3xl font-black ${txt}`}>{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className={`text-sm ${txtF}`}>{reputationStats.totalReviews} opiniones</span>
              </div>
            )}
          </div>
          {/* Trust: bold with vertical separators */}
          <div className={`flex items-center gap-6 mt-6 pt-5 border-t ${borderCls}`}>
            <span className="flex items-center gap-2"><Flame className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" /><span className={`text-sm font-bold ${trustTxt}`}>CONFIRMACIÓN INMEDIATA</span></span>
            <span className={`w-px h-5 ${isLT ? 'bg-white/30' : 'bg-slate-300'}`} />
            <span className="flex items-center gap-2"><Shield className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" /><span className={`text-sm font-bold ${trustTxt}`}>100% SEGURO</span></span>
            <span className={`w-px h-5 ${isLT ? 'bg-white/30' : 'bg-slate-300'}`} />
            <span className="flex items-center gap-2"><Activity className="h-5 w-5 text-[hsl(var(--tenant-accent-300))]" /><span className={`text-sm font-bold ${trustTxt}`}>{reputationStats?.recentBookingsText?.toUpperCase() || 'RESERVÁ AHORA'}</span></span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WARM — Fondo claro amber/rose, bordes redondeados, iconos en cajas calidas
// ═══════════════════════════════════════════════════════════════════════════════
function WarmHero({ tenant, reputationStats, coverSettings }: Omit<Props, 'heroStyle'>) {
  const hidelogo = coverSettings?.showProfilePhoto === false;
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          {hasCustomOverlay(coverSettings) ? <CoverOverlay coverSettings={coverSettings} /> : (
            <div className="absolute inset-0 bg-white/75 dark:bg-neutral-900/80 backdrop-blur-sm" />
          )}
          <CoverFade coverSettings={coverSettings} />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] via-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-950)_/_0.3)] dark:via-[hsl(var(--tenant-primary-950)_/_0.2)] dark:to-[hsl(var(--tenant-secondary-950)_/_0.2)]" />
      )}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[hsl(var(--tenant-primary-200)_/_0.3)] dark:bg-[hsl(var(--tenant-primary-800)_/_0.15)] rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[hsl(var(--tenant-secondary-200)_/_0.2)] dark:bg-[hsl(var(--tenant-secondary-800)_/_0.1)] rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <LogoFallback tenant={tenant} size="w-16 h-16" radius="rounded-2xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-xl" border="border-2 border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800))]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} lightMode />
            </div>
          </div>
          {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">{tenant.description}</p>}
          <div className="flex items-center justify-center gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><MapPin className="h-4 w-4 text-[hsl(var(--tenant-primary-600))]" />Dirección</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Phone className="h-4 w-4 text-[hsl(var(--tenant-accent-600))]" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Instagram className="h-4 w-4 text-[hsl(var(--tenant-secondary-500))]" />Instagram</a>}
          </div>
          {/* Trust: warm colored icon boxes */}
          <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-[hsl(var(--tenant-primary-200)_/_0.5)] dark:border-[hsl(var(--tenant-primary-800)_/_0.3)]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-[hsl(var(--tenant-primary-100))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.4)] flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]" /></div><span>Inmediato</span></div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-[hsl(var(--tenant-accent-100))] dark:bg-[hsl(var(--tenant-accent-900)_/_0.4)] flex items-center justify-center"><Shield className="h-3.5 w-3.5 text-[hsl(var(--tenant-accent-600))] dark:text-[hsl(var(--tenant-accent-400))]" /></div><span>Seguro</span></div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-[hsl(var(--tenant-secondary-100))] dark:bg-[hsl(var(--tenant-secondary-900)_/_0.4)] flex items-center justify-center"><Heart className="h-3.5 w-3.5 text-[hsl(var(--tenant-secondary-500))] dark:text-[hsl(var(--tenant-secondary-400))]" /></div><span>Garantizado</span></div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-2xl" gradient="bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]" textSize="text-4xl lg:text-5xl" border="border-2 border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800))]" hidden={hidelogo} />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">{tenant.name}</h1>
              {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-base lg:text-lg max-w-2xl mb-4">{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow cursor-pointer"><MapPin className="h-5 w-5 text-[hsl(var(--tenant-primary-600))]" />Dirección</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Phone className="h-5 w-5 text-[hsl(var(--tenant-accent-600))]" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Instagram className="h-5 w-5 text-[hsl(var(--tenant-secondary-500))]" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
              <div className="hidden lg:block bg-white/80 dark:bg-neutral-800/80 border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800)_/_0.3)] rounded-2xl px-6 py-4 shadow-sm text-center">
                <div className="flex items-center gap-1.5 mb-0.5"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="text-2xl font-bold text-slate-900 dark:text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-xs text-slate-500 dark:text-neutral-400">{reputationStats.totalReviews} opiniones</span>
              </div>
            ) : null}
          </div>
          {/* Trust: warm icon boxes */}
          <div className="flex items-center gap-8 mt-6 pt-5 border-t border-[hsl(var(--tenant-primary-200)_/_0.5)] dark:border-[hsl(var(--tenant-primary-800)_/_0.3)]">
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-primary-100))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.4)] flex items-center justify-center"><Zap className="h-5 w-5 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]" /></div><span className="text-base">Confirmación Inmediata</span></div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-accent-100))] dark:bg-[hsl(var(--tenant-accent-900)_/_0.4)] flex items-center justify-center"><Shield className="h-5 w-5 text-[hsl(var(--tenant-accent-600))] dark:text-[hsl(var(--tenant-accent-400))]" /></div><span className="text-base">100% Seguro</span></div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-[hsl(var(--tenant-secondary-100))] dark:bg-[hsl(var(--tenant-secondary-900)_/_0.4)] flex items-center justify-center"><Heart className="h-5 w-5 text-[hsl(var(--tenant-secondary-500))] dark:text-[hsl(var(--tenant-secondary-400))]" /></div><span className="text-base">{reputationStats?.recentBookingsText || 'Reserva tu turno'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component — routes to the right template
// ═══════════════════════════════════════════════════════════════════════════════
export function PublicHero({ tenant, reputationStats, heroStyle, coverSettings }: Props) {
  switch (heroStyle) {
    case 'clinical':   return <ClinicalHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'bold':       return <BoldHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'zen':        return <ZenHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'corporate':  return <CorporateHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'energetic':  return <EnergeticHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'warm':       return <WarmHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
    case 'classic':
    default:           return <ClassicHero tenant={tenant} reputationStats={reputationStats} coverSettings={coverSettings} />;
  }
}
