'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  Send,
  Inbox,
  UserCog,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createApiClient, TalentProfile, TalentProposal, JobApplication } from '@/lib/api';
import { cn } from '@/lib/utils';

// --- Profile completeness calculation ---
function calcCompleteness(profile: TalentProfile) {
  const checks: { label: string; weight: number; done: boolean }[] = [
    { label: 'Nombre', weight: 10, done: !!profile.name },
    { label: 'Titular', weight: 10, done: !!profile.headline },
    { label: 'Bio', weight: 10, done: !!profile.bio },
    { label: 'Especialidad', weight: 10, done: !!profile.specialty },
    { label: 'Categoria', weight: 10, done: !!profile.category },
    { label: 'Foto', weight: 15, done: !!profile.image },
    { label: 'Especialidades', weight: 10, done: (profile.skills?.length || 0) > 0 },
    { label: 'Disponibilidad', weight: 5, done: !!profile.availability },
    { label: 'Zonas', weight: 5, done: (profile.preferredZones?.length || 0) > 0 },
    { label: 'Experiencia', weight: 10, done: (profile.experiences?.length || 0) > 0 },
    { label: 'Certificaciones', weight: 5, done: (profile.certifications?.length || 0) > 0 },
  ];
  const pct = checks.reduce((acc, c) => acc + (c.done ? c.weight : 0), 0);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  return { pct, missing };
}

// --- Status badge helpers ---
const proposalStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary' },
  ACCEPTED: { label: 'Aceptada', variant: 'default' },
  REJECTED: { label: 'Rechazada', variant: 'destructive' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
};

const applicationStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary' },
  REVIEWED: { label: 'Revisada', variant: 'outline' },
  ACCEPTED: { label: 'Aceptada', variant: 'default' },
  REJECTED: { label: 'Rechazada', variant: 'destructive' },
  WITHDRAWN: { label: 'Retirada', variant: 'outline' },
};

function ShareProfileButton({ profileId, profileName }: { profileId: string; profileName: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/profesional/${profileId}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} — TurnoLink`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <Button size="sm" variant="outline" className="gap-2" onClick={handleShare}>
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Link copiado' : 'Compartir perfil'}
    </Button>
  );
}

export default function MiPerfilDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [proposals, setProposals] = useState<TalentProposal[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [availableJobs, setAvailableJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);

    Promise.allSettled([
      api.getMyProfile(),
      api.getMyProposals(),
      api.getMyJobApplications(),
      api.browseJobPostings({ limit: '1' }),
    ]).then(([profileRes, proposalsRes, applicationsRes, jobsRes]) => {
      if (profileRes.status === 'fulfilled' && profileRes.value) setProfile(profileRes.value);
      if (proposalsRes.status === 'fulfilled') setProposals(proposalsRes.value || []);
      if (applicationsRes.status === 'fulfilled') setApplications(applicationsRes.value || []);
      if (jobsRes.status === 'fulfilled') setAvailableJobs(jobsRes.value?.total || 0);
      setLoading(false);
    });
  }, [session?.accessToken]);

  // --- Computed stats ---
  const stats = useMemo(() => {
    const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;
    const activeApplications = applications.filter((a) => a.status === 'PENDING' || a.status === 'REVIEWED').length;
    const accepted = proposals.filter((p) => p.status === 'ACCEPTED').length + applications.filter((a) => a.status === 'ACCEPTED').length;
    return { pendingProposals, activeApplications, accepted, availableJobs };
  }, [proposals, applications, availableJobs]);

  const completeness = useMemo(() => (profile ? calcCompleteness(profile) : null), [profile]);

  // --- Greeting ---
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* A. Hero header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-28 sm:w-36 h-28 sm:h-36 bg-white/10 rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm font-medium text-white/80 truncate">
              {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {greeting()}, {session?.user?.name?.split(' ')[0] || 'Profesional'}
          </h1>
          <p className="mt-1 text-white/80 text-sm sm:text-base">
            {profile ? 'Tu resumen profesional de hoy' : 'Completa tu perfil para empezar a recibir propuestas'}
          </p>
        </div>
      </div>

      {/* B. Profile completeness card */}
      {profile && completeness && (
        <Card className="border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                {completeness.pct === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <h3 className="font-semibold">
                  {completeness.pct === 100 ? 'Perfil completo' : 'Completa tu perfil'}
                </h3>
              </div>
              <span className="text-sm font-bold text-primary">{completeness.pct}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  completeness.pct === 100
                    ? 'bg-emerald-500'
                    : completeness.pct >= 70
                      ? 'bg-primary'
                      : 'bg-amber-500'
                )}
                style={{ width: `${completeness.pct}%` }}
              />
            </div>

            {/* Missing items */}
            {completeness.missing.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {completeness.missing.map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            {/* Visibility indicators */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1.5">
                {profile.profileVisible ? (
                  <Eye className="h-4 w-4 text-emerald-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={profile.profileVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                  Perfil {profile.profileVisible ? 'visible' : 'oculto'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className={cn('h-4 w-4', profile.openToWork ? 'text-emerald-500' : 'text-muted-foreground')} />
                <span className={profile.openToWork ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                  {profile.openToWork ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>

            {/* Share profile */}
            {profile.profileVisible ? (
              <ShareProfileButton profileId={profile.id} profileName={profile.name} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Activá la visibilidad para compartir tu perfil.
              </p>
            )}

            {completeness.pct < 100 && (
              <Link href="/mi-perfil/editar">
                <Button size="sm" className="w-full sm:w-auto">
                  Completar perfil
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* No profile yet — CTA */}
      {!profile && (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="p-6 text-center">
            <UserCog className="mx-auto h-12 w-12 text-primary/50 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Crea tu perfil profesional</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Completa tu perfil para aparecer en las busquedas y recibir propuestas de comercios.
            </p>
            <Link href="/mi-perfil/editar">
              <Button>
                Crear perfil
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* C. Stats grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Propuestas</CardTitle>
            <Inbox className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingProposals}</div>
            <p className="text-xs text-white/70 mt-1">pendientes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Postulaciones</CardTitle>
            <Send className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeApplications}</div>
            <p className="text-xs text-white/70 mt-1">activas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Aceptadas</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-white/70 mt-1">total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Ofertas</CardTitle>
            <Briefcase className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.availableJobs}</div>
            <p className="text-xs text-white/70 mt-1">disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* D. Two-column grid: proposals + applications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Proposals */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Propuestas Recientes</CardTitle>
            </div>
            <Link href="/mi-perfil/propuestas">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {proposals.length > 0 ? (
              <div className="divide-y">
                {proposals.slice(0, 3).map((proposal) => {
                  const st = proposalStatusMap[proposal.status] || proposalStatusMap.PENDING;
                  return (
                    <div key={proposal.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{proposal.senderTenant?.name || 'Comercio'}</p>
                        <p className="text-sm text-muted-foreground truncate">{proposal.role}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                  <Inbox className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-muted-foreground">Sin propuestas aun</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Completa tu perfil para recibir propuestas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <Send className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">Postulaciones Recientes</CardTitle>
            </div>
            <Link href="/mi-perfil/postulaciones">
              <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {applications.length > 0 ? (
              <div className="divide-y">
                {applications.slice(0, 3).map((app) => {
                  const st = applicationStatusMap[app.status] || applicationStatusMap.PENDING;
                  return (
                    <div key={app.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{app.posting?.title || 'Oferta'}</p>
                        <p className="text-sm text-muted-foreground truncate">{app.posting?.tenant?.name || 'Comercio'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                  <Send className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-muted-foreground">Sin postulaciones aun</p>
                <Link href="/mi-perfil/ofertas" className="mt-2">
                  <Button variant="link" size="sm" className="text-primary">
                    Explorar ofertas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* E. Quick actions */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Link href="/mi-perfil/ofertas" className="group">
          <Card className="border shadow-sm hover:shadow-md transition-all cursor-pointer group-hover:scale-[1.02]">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold">Buscar ofertas</h3>
              <p className="text-sm text-muted-foreground mt-1">Explora oportunidades laborales</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mi-perfil/editar" className="group">
          <Card className="border shadow-sm hover:shadow-md transition-all cursor-pointer group-hover:scale-[1.02]">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Editar perfil</h3>
              <p className="text-sm text-muted-foreground mt-1">Actualiza tu informacion profesional</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seguridad" className="group">
          <Card className="border shadow-sm hover:shadow-md transition-all cursor-pointer group-hover:scale-[1.02]">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-xl bg-slate-500/10 dark:bg-slate-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="font-semibold">Configuracion</h3>
              <p className="text-sm text-muted-foreground mt-1">Seguridad y ajustes de cuenta</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
