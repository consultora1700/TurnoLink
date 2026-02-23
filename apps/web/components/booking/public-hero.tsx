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

interface Props {
  tenant: Tenant;
  reputationStats: ReputationStats | null;
  heroStyle: HeroStyleName;
}

// ─── Shared tiny helpers ──────────────────────────────────────────────────────

function Logo({ tenant, size, radius, border, className }: {
  tenant: Tenant; size: string; radius: string; border: string; className?: string;
}) {
  if (tenant.logo) {
    return <img src={tenant.logo} alt={tenant.name} className={`${size} ${radius} object-cover ${border} shadow-xl shrink-0 ${className || ''}`} />;
  }
  return null;
}

function LogoFallback({ tenant, size, radius, gradient, textSize, border, className }: {
  tenant: Tenant; size: string; radius: string; gradient: string; textSize: string; border: string; className?: string;
}) {
  if (tenant.logo) return <Logo tenant={tenant} size={size} radius={radius} border={border} className={className} />;
  return (
    <div className={`${size} ${radius} ${gradient} flex items-center justify-center ${border} shadow-xl shrink-0 ${className || ''}`}>
      <span className={`${textSize} font-bold text-white`}>{tenant.name.charAt(0)}</span>
    </div>
  );
}

function RatingLine({ stats, lightMode }: { stats: ReputationStats | null; lightMode?: boolean }) {
  const textA = lightMode ? 'text-slate-700' : 'text-white/80';
  const textB = lightMode ? 'text-slate-400' : 'text-white/40';
  const textC = lightMode ? 'text-slate-500' : 'text-white/70';
  const newColor = lightMode ? 'text-emerald-600' : 'text-emerald-300';

  if (stats?.totalReviews && stats.totalReviews > 0) {
    return (
      <div className="flex items-center gap-2 text-xs">
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
    <div className={`flex items-center gap-1.5 text-xs ${newColor}`}>
      <Sparkles className="h-3 w-3" />
      <span className="font-medium">Nuevo en TurnoLink</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSIC — pink→fuchsia→violet gradient, sparkle badges, rounded pills
// ═══════════════════════════════════════════════════════════════════════════════
function ClassicHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-600 to-violet-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </>
      )}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-300/30 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-xl" gradient="bg-gradient-to-br from-violet-500 to-teal-500" textSize="text-xl" border="border-2 border-white/20" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-white truncate">{tenant.name}</h1>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[10px] px-1.5 py-0.5 shrink-0">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />Online
                </Badge>
              </div>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {tenant.description && <p className="text-white/80 text-sm mb-4">{tenant.description}</p>}
          <div className="flex items-center justify-center gap-2">
            {tenant.city && (
              <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm hover:bg-white/20"><MapPin className="h-4 w-4 text-violet-300" />Dirección</button>
            )}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm hover:bg-white/20"><Phone className="h-4 w-4 text-emerald-300" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm hover:bg-white/20"><Instagram className="h-4 w-4 text-teal-300" />Instagram</a>}
          </div>
          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-white/70 text-xs"><Zap className="h-4 w-4 text-violet-300" /><span>Inmediato</span></div>
            <div className="flex items-center gap-1.5 text-white/70 text-xs"><Shield className="h-4 w-4 text-emerald-300" /><span>Seguro</span></div>
            <div className="flex items-center gap-1.5 text-white/70 text-xs"><Heart className="h-4 w-4 text-teal-300" /><span>Garantizado</span></div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-2xl" gradient="bg-gradient-to-br from-violet-500 to-teal-500" textSize="text-4xl lg:text-5xl" border="border-2 border-white/20" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-white">{tenant.name}</h1>
                <Badge className="bg-white/10 text-white border-white/20 text-sm px-3 py-1"><Sparkles className="h-4 w-4 mr-1.5" />Online 24/7</Badge>
              </div>
              {tenant.description && <p className="text-white/80 text-base lg:text-lg max-w-2xl mb-4">{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80 hover:bg-white/20 transition-colors cursor-pointer"><MapPin className="h-5 w-5 text-violet-300" />Dirección</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80 hover:bg-white/20 transition-colors"><Phone className="h-5 w-5 text-emerald-300" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80 hover:bg-white/20 transition-colors"><Instagram className="h-5 w-5 text-teal-300" />Instagram</a>}
              </div>
            </div>
            {/* Stats */}
            <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur rounded-2xl px-6 py-4">
              {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Star className="h-6 w-6 fill-amber-400 text-amber-400" /><span className="text-3xl font-bold text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                    <span className="text-sm text-white/60">{reputationStats.totalReviews} opiniones</span>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Users className="h-6 w-6 text-violet-300" /><span className="text-3xl font-bold text-white">{reputationStats.recentBookingsCount >= 10 ? `${Math.floor(reputationStats.recentBookingsCount / 10) * 10}+` : reputationStats.recentBookingsCount.toString()}</span></div>
                    <span className="text-sm text-white/60">Esta semana</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 px-2"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Sparkles className="h-6 w-6 text-emerald-300" /></div><div><span className="text-lg font-bold text-white">Nuevo</span><p className="text-sm text-white/60">Recién llegamos</p></div></div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-8 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-3 text-white/70"><div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center"><Zap className="h-5 w-5 text-violet-300" /></div><span className="text-base">Confirmación Inmediata</span></div>
            <div className="flex items-center gap-3 text-white/70"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Shield className="h-5 w-5 text-emerald-300" /></div><span className="text-base">100% Seguro</span></div>
            <div className="flex items-center gap-3 text-white/70"><div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center"><Heart className="h-5 w-5 text-teal-300" /></div><span className="text-base">{reputationStats?.recentBookingsText || 'Reserva tu turno'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL — Fondo claro, linea lateral teal, iconos de verificación, sin decoraciones
// ═══════════════════════════════════════════════════════════════════════════════
function ClinicalHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative z-10 border-b border-slate-200 dark:border-neutral-700">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-sm" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50 to-teal-50/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-teal-950/30" />
      )}
      {/* Teal left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-cyan-500" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-lg" gradient="bg-gradient-to-br from-teal-500 to-cyan-500" textSize="text-xl" border="border-2 border-teal-200 dark:border-teal-800" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                <Check className="h-3 w-3" /><span>Centro verificado</span>
              </div>
            </div>
          </div>
          {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">{tenant.description}</p>}
          {/* Contact as simple text links */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline"><MapPin className="h-3.5 w-3.5" />Ver ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline"><Phone className="h-3.5 w-3.5" />{tenant.phone}</a>}
          </div>
          {/* Trust: simple checkmarks in a row */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-neutral-700 text-xs text-slate-500 dark:text-neutral-400">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-teal-500" />Turnos online</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-teal-500" />Conf. inmediata</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-teal-500" />Seguro</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-2 lg:py-4">
          <div className="flex items-center gap-6">
            <LogoFallback tenant={tenant} size="w-20 h-20 lg:w-24 lg:h-24" radius="rounded-lg" gradient="bg-gradient-to-br from-teal-500 to-cyan-500" textSize="text-3xl lg:text-4xl" border="border-2 border-teal-200 dark:border-teal-800" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{tenant.name}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <Check className="h-3 w-3" />Verificado
                </span>
              </div>
              {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-sm lg:text-base max-w-xl mb-3">{tenant.description}</p>}
              <div className="flex items-center gap-4 text-sm">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"><MapPin className="h-4 w-4" />Ver ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline"><Phone className="h-4 w-4" />{tenant.phone}</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline"><Instagram className="h-4 w-4" />@{tenant.instagram.replace('@', '')}</a>}
              </div>
            </div>
            {/* Rating as clean number */}
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
              <div className="hidden lg:block text-center bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-6 py-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-0.5"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="text-2xl font-bold text-slate-900 dark:text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-xs text-slate-500">{reputationStats.totalReviews} opiniones</span>
              </div>
            ) : null}
          </div>
          {/* Bottom trust row — plain checkmarks */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-200 dark:border-neutral-700 text-sm text-slate-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-500" />Turnos online 24/7</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-500" />Confirmación inmediata</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-500" />Datos protegidos</span>
            {reputationStats?.recentBookingsText && <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-500" />{reputationStats.recentBookingsText}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOLD — Fondo oscuro, angular, patron geométrico, tipografia gruesa
// ═══════════════════════════════════════════════════════════════════════════════
function BoldHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-black/75" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-zinc-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.06%27%20fill-rule=%27evenodd%27%3E%3Cpath%20d=%27M0%200h20v20H0V0zm20%2020h20v20H20V20z%27/%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/10 to-transparent skew-x-[-12deg] translate-x-20" />
        </>
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* ── Mobile ── */}
        <div className="md:hidden flex flex-col">
          {/* Row 1: Logo + Name + Rating */}
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-sm" gradient="bg-gradient-to-br from-amber-500 to-orange-600" textSize="text-xl" border="border-2 border-amber-500/30" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black tracking-tight text-white uppercase truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {/* Row 2: Description — always visible, no toggle to prevent layout shift */}
          {tenant.description && (
            <p className="text-white/60 text-xs leading-relaxed mb-3">{tenant.description}</p>
          )}
          {/* Row 3: Action buttons — grid cols-3 */}
          <div className="grid grid-cols-3 gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/80 text-xs hover:bg-amber-500/20 transition-colors"><MapPin className="h-3.5 w-3.5 text-amber-400" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/80 text-xs hover:bg-amber-500/20 transition-colors"><Phone className="h-3.5 w-3.5 text-amber-400" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-white/10 rounded-sm py-2 text-white/80 text-xs hover:bg-amber-500/20 transition-colors"><Instagram className="h-3.5 w-3.5 text-amber-400" />Instagram</a>}
          </div>
          {/* Row 4: Trust badges — footer-like strip with dividers */}
          <div className="flex items-center mt-3 pt-2.5 border-t border-white/10">
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/40 uppercase tracking-wider"><Zap className="h-3 w-3 text-amber-500/60" />Rápido</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/40 uppercase tracking-wider"><Shield className="h-3 w-3 text-amber-500/60" />Seguro</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="flex-1 flex items-center justify-center gap-1 text-[10px] text-white/40 uppercase tracking-wider"><Award className="h-3 w-3 text-amber-500/60" />Premium</span>
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-center gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-sm" gradient="bg-gradient-to-br from-amber-500 to-orange-600" textSize="text-4xl lg:text-5xl" border="border-2 border-amber-500/30" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase mb-2">{tenant.name}</h1>
              {tenant.description && <p className="text-white/60 text-sm max-w-xl mb-3 line-clamp-2">{tenant.description}</p>}
              <div className="flex items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/80 text-sm hover:bg-amber-500/20 transition-colors cursor-pointer"><MapPin className="h-4 w-4 text-amber-400" />Ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/80 text-sm hover:bg-amber-500/20 transition-colors"><Phone className="h-4 w-4 text-amber-400" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 rounded-sm px-4 py-2 text-white/80 text-sm hover:bg-amber-500/20 transition-colors"><Instagram className="h-4 w-4 text-amber-400" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
              <div className="hidden lg:block bg-white/5 border border-white/10 rounded-sm px-6 py-4">
                <div className="flex items-center gap-2 mb-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="text-3xl font-black text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-xs text-white/50 uppercase tracking-wider">{reputationStats.totalReviews} opiniones</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Trust strip — full-width bar below hero content, desktop only */}
      <div className="hidden md:block relative border-t border-white/10">
        <div className="flex items-center">
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/40 uppercase tracking-wider"><Zap className="h-3.5 w-3.5 text-amber-500/60" />Rápido</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/40 uppercase tracking-wider"><Shield className="h-3.5 w-3.5 text-amber-500/60" />Seguro</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] text-white/40 uppercase tracking-wider"><Award className="h-3.5 w-3.5 text-amber-500/60" />Premium</span>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZEN — Centrado, mucho espacio, tipografia liviana, onda organica SVG
// ═══════════════════════════════════════════════════════════════════════════════
function ZenHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50/80 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-neutral-900" />
          {/* Organic wave SVG */}
          <svg className="absolute bottom-0 left-0 w-full h-16 text-white dark:text-neutral-900" viewBox="0 0 1440 64" preserveAspectRatio="none"><path fill="currentColor" d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,48 1440,32 L1440,64 L0,64 Z" /></svg>
        </>
      )}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-teal-200/20 dark:bg-teal-700/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex justify-center mb-4">
            <LogoFallback tenant={tenant} size="w-20 h-20" radius="rounded-full" gradient="bg-gradient-to-br from-emerald-400 to-teal-500" textSize="text-2xl" border="border-4 border-white dark:border-neutral-800 shadow-lg" />
          </div>
          <h1 className="text-xl font-medium tracking-wide text-slate-800 dark:text-white mb-2">{tenant.name}</h1>
          {tenant.description && <p className="text-slate-500 dark:text-neutral-400 text-sm max-w-xs mx-auto mb-5 leading-relaxed">{tenant.description}</p>}
          <RatingLine stats={reputationStats} lightMode />
          <div className="flex items-center justify-center gap-3 mt-5">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><MapPin className="h-4 w-4 text-emerald-500" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Phone className="h-4 w-4 text-teal-500" />Llamar</a>}
          </div>
          {/* Trust: minimal text with dots */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400 dark:text-neutral-500">
            <span>Reserva fácil</span><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" /><span>Conf. inmediata</span><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600" /><span>Seguro</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex justify-center mb-5">
            <LogoFallback tenant={tenant} size="w-28 h-28 lg:w-32 lg:h-32" radius="rounded-full" gradient="bg-gradient-to-br from-emerald-400 to-teal-500" textSize="text-4xl lg:text-5xl" border="border-4 border-white dark:border-neutral-800 shadow-xl" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium tracking-wide text-slate-800 dark:text-white mb-3">{tenant.name}</h1>
          {tenant.description && <p className="text-slate-500 dark:text-neutral-400 text-base lg:text-lg max-w-lg mx-auto mb-6 leading-relaxed">{tenant.description}</p>}
          <div className="flex items-center justify-center gap-4 mb-6">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow cursor-pointer"><MapPin className="h-5 w-5 text-emerald-500" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Phone className="h-5 w-5 text-teal-500" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 shadow-sm rounded-full px-5 py-2.5 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Instagram className="h-5 w-5 text-cyan-500" />Instagram</a>}
          </div>
          {/* Trust: spacious text separated by dots */}
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 dark:text-neutral-500">
            <span className="flex items-center gap-1.5"><Leaf className="h-4 w-4 text-emerald-400" />Reserva fácil</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700" />
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-teal-400" />Confirmación inmediata</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700" />
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-cyan-400" />100% seguro</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE — Compacto, side-by-side, sin decoraciones, tipografia seria
// ═══════════════════════════════════════════════════════════════════════════════
function CorporateHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/80" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-12 h-12" radius="rounded-md" gradient="bg-gradient-to-br from-blue-600 to-indigo-600" textSize="text-lg" border="border border-white/20" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {tenant.description && <p className="text-white/60 text-sm mb-3 line-clamp-2">{tenant.description}</p>}
          <div className="flex items-center gap-2 text-xs">
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 bg-white/10 rounded-md px-2.5 py-1.5 text-white/70 hover:bg-white/20 transition-colors"><Phone className="h-3.5 w-3.5" />{tenant.phone}</a>}
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1 bg-white/10 rounded-md px-2.5 py-1.5 text-white/70 hover:bg-white/20 transition-colors"><MapPin className="h-3.5 w-3.5" />Ubicación</button>}
          </div>
        </div>

        {/* Desktop — compact single row */}
        <div className="hidden md:flex items-center gap-5">
          <LogoFallback tenant={tenant} size="w-16 h-16 lg:w-20 lg:h-20" radius="rounded-md" gradient="bg-gradient-to-br from-blue-600 to-indigo-600" textSize="text-2xl lg:text-3xl" border="border border-white/20" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">{tenant.name}</h1>
              <Briefcase className="h-4 w-4 text-blue-300" />
            </div>
            {tenant.description && <p className="text-white/60 text-sm max-w-lg truncate">{tenant.description}</p>}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/70 hover:bg-white/20 transition-colors"><Phone className="h-4 w-4" />{tenant.phone}</a>}
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/70 hover:bg-white/20 transition-colors cursor-pointer"><MapPin className="h-4 w-4" />Ubicación</button>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-2 text-white/70 hover:bg-white/20 transition-colors"><Globe className="h-4 w-4" />Web</a>}
          </div>
          {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
            <div className="hidden lg:flex items-center gap-2 bg-white/10 rounded-md px-4 py-2.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-white">{reputationStats.averageRating.toFixed(1)}</span>
              <span className="text-xs text-white/50">({reputationStats.totalReviews})</span>
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
function EnergeticHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/70 via-orange-500/60 to-yellow-500/50" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.06%27%3E%3Cpolygon%20points=%2730%200%2060%2030%2030%2060%200%2030%27/%3E%3C/g%3E%3C/svg%3E')]" />
          {/* Diagonal energy bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500" />
        </>
      )}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3">
            <LogoFallback tenant={tenant} size="w-14 h-14" radius="rounded-xl" gradient="bg-gradient-to-br from-red-500 to-orange-500" textSize="text-xl" border="border-2 border-yellow-400/30" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black tracking-tight text-white truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} />
            </div>
          </div>
          {tenant.description && <p className="text-white/80 text-sm mb-4 font-medium">{tenant.description}</p>}
          <div className="flex items-center gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-black/20 backdrop-blur rounded-full px-3 py-1.5 text-white text-sm font-semibold hover:bg-black/30 transition-colors"><MapPin className="h-4 w-4 text-yellow-300" />Ubicación</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-black/20 backdrop-blur rounded-full px-3 py-1.5 text-white text-sm font-semibold hover:bg-black/30 transition-colors"><Phone className="h-4 w-4 text-yellow-300" />Llamar</a>}
          </div>
          {/* Trust: bold with vertical separators */}
          <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-white/20">
            <span className="text-xs font-bold text-white/90 flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-yellow-300" />RÁPIDO</span>
            <span className="w-px h-4 bg-white/30" />
            <span className="text-xs font-bold text-white/90 flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-yellow-300" />SEGURO</span>
            <span className="w-px h-4 bg-white/30" />
            <span className="text-xs font-bold text-white/90 flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-yellow-300" />ACTIVO</span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-xl" gradient="bg-gradient-to-br from-red-500 to-orange-500" textSize="text-4xl lg:text-5xl" border="border-2 border-yellow-400/30" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">{tenant.name}</h1>
              {tenant.description && <p className="text-white/80 text-base lg:text-lg max-w-2xl mb-4 font-medium">{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-black/20 backdrop-blur rounded-full px-4 py-2 text-white font-semibold hover:bg-black/30 transition-colors cursor-pointer"><MapPin className="h-5 w-5 text-yellow-300" />Ubicación</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-black/20 backdrop-blur rounded-full px-4 py-2 text-white font-semibold hover:bg-black/30 transition-colors"><Phone className="h-5 w-5 text-yellow-300" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 backdrop-blur rounded-full px-4 py-2 text-white font-semibold hover:bg-black/30 transition-colors"><Instagram className="h-5 w-5 text-yellow-300" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 && (
              <div className="hidden lg:block bg-black/20 backdrop-blur rounded-2xl px-6 py-4 text-center">
                <div className="flex items-center gap-2 mb-1"><Star className="h-6 w-6 fill-yellow-400 text-yellow-400" /><span className="text-3xl font-black text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-sm text-white/60">{reputationStats.totalReviews} opiniones</span>
              </div>
            )}
          </div>
          {/* Trust: bold with vertical separators */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/20">
            <span className="flex items-center gap-2"><Flame className="h-5 w-5 text-yellow-300" /><span className="text-sm font-bold text-white/90">CONFIRMACIÓN INMEDIATA</span></span>
            <span className="w-px h-5 bg-white/30" />
            <span className="flex items-center gap-2"><Shield className="h-5 w-5 text-yellow-300" /><span className="text-sm font-bold text-white/90">100% SEGURO</span></span>
            <span className="w-px h-5 bg-white/30" />
            <span className="flex items-center gap-2"><Activity className="h-5 w-5 text-yellow-300" /><span className="text-sm font-bold text-white/90">{reputationStats?.recentBookingsText?.toUpperCase() || 'RESERVÁ AHORA'}</span></span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WARM — Fondo claro amber/rose, bordes redondeados, iconos en cajas calidas
// ═══════════════════════════════════════════════════════════════════════════════
function WarmHero({ tenant, reputationStats }: Omit<Props, 'heroStyle'>) {
  return (
    <header className="relative overflow-hidden z-10">
      {tenant.coverImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tenant.coverImage})` }} />
          <div className="absolute inset-0 bg-white/75 dark:bg-neutral-900/80 backdrop-blur-sm" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-teal-950/20" />
      )}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-200/30 dark:bg-amber-800/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <LogoFallback tenant={tenant} size="w-16 h-16" radius="rounded-2xl" gradient="bg-gradient-to-br from-amber-500 to-teal-500" textSize="text-xl" border="border-2 border-amber-200 dark:border-amber-800" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{tenant.name}</h1>
              <RatingLine stats={reputationStats} lightMode />
            </div>
          </div>
          {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">{tenant.description}</p>}
          <div className="flex items-center justify-center gap-2">
            {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><MapPin className="h-4 w-4 text-amber-600" />Dirección</button>}
            {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Phone className="h-4 w-4 text-emerald-600" />Llamar</a>}
            {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-3 py-1.5 text-slate-600 dark:text-neutral-300 text-sm hover:shadow-md transition-shadow"><Instagram className="h-4 w-4 text-teal-500" />Instagram</a>}
          </div>
          {/* Trust: warm colored icon boxes */}
          <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /></div><span>Inmediato</span></div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /></div><span>Seguro</span></div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 text-xs"><div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center"><Heart className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" /></div><span>Garantizado</span></div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block py-4 lg:py-6">
          <div className="flex items-start gap-8">
            <LogoFallback tenant={tenant} size="w-24 h-24 lg:w-28 lg:h-28" radius="rounded-2xl" gradient="bg-gradient-to-br from-amber-500 to-teal-500" textSize="text-4xl lg:text-5xl" border="border-2 border-amber-200 dark:border-amber-800" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">{tenant.name}</h1>
              {tenant.description && <p className="text-slate-600 dark:text-neutral-400 text-base lg:text-lg max-w-2xl mb-4">{tenant.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {tenant.city && <button onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow cursor-pointer"><MapPin className="h-5 w-5 text-amber-600" />Dirección</button>}
                {tenant.phone && <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Phone className="h-5 w-5 text-emerald-600" />Llamar</a>}
                {tenant.instagram && <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/80 dark:bg-neutral-800/80 shadow-sm rounded-full px-4 py-2 text-slate-600 dark:text-neutral-300 hover:shadow-md transition-shadow"><Instagram className="h-5 w-5 text-teal-500" />Instagram</a>}
              </div>
            </div>
            {reputationStats?.totalReviews && reputationStats.totalReviews > 0 ? (
              <div className="hidden lg:block bg-white/80 dark:bg-neutral-800/80 border border-amber-200 dark:border-amber-800/30 rounded-2xl px-6 py-4 shadow-sm text-center">
                <div className="flex items-center gap-1.5 mb-0.5"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="text-2xl font-bold text-slate-900 dark:text-white">{reputationStats.averageRating.toFixed(1)}</span></div>
                <span className="text-xs text-slate-500 dark:text-neutral-400">{reputationStats.totalReviews} opiniones</span>
              </div>
            ) : null}
          </div>
          {/* Trust: warm icon boxes */}
          <div className="flex items-center gap-8 mt-6 pt-5 border-t border-amber-200/50 dark:border-amber-800/30">
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"><Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><span className="text-base">Confirmación Inmediata</span></div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><span className="text-base">100% Seguro</span></div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-neutral-400"><div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center"><Heart className="h-5 w-5 text-teal-500 dark:text-teal-400" /></div><span className="text-base">{reputationStats?.recentBookingsText || 'Reserva tu turno'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component — routes to the right template
// ═══════════════════════════════════════════════════════════════════════════════
export function PublicHero({ tenant, reputationStats, heroStyle }: Props) {
  switch (heroStyle) {
    case 'clinical':   return <ClinicalHero tenant={tenant} reputationStats={reputationStats} />;
    case 'bold':       return <BoldHero tenant={tenant} reputationStats={reputationStats} />;
    case 'zen':        return <ZenHero tenant={tenant} reputationStats={reputationStats} />;
    case 'corporate':  return <CorporateHero tenant={tenant} reputationStats={reputationStats} />;
    case 'energetic':  return <EnergeticHero tenant={tenant} reputationStats={reputationStats} />;
    case 'warm':       return <WarmHero tenant={tenant} reputationStats={reputationStats} />;
    case 'classic':
    default:           return <ClassicHero tenant={tenant} reputationStats={reputationStats} />;
  }
}
