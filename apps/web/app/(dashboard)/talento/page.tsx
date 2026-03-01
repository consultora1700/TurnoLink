'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { createApiClient, TalentProfile, PaginatedResponse } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  Briefcase,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCheck,
  Clock,
  Send,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Star,
} from 'lucide-react';
import { ProfileHeader } from '@/components/profile/profile-header';
import { CATEGORY_CARD_ACCENTS } from '@/lib/profile-templates';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_SEARCH_TERMS } from '@/lib/category-config';
import { CategoryChip } from '@/components/ui/category-icon';


function TalentoContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Read category from URL directly (avoids useSearchParams + Suspense delay)
  const [categoryParam, setCategoryParam] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('category');
    }
    return null;
  });

  // Sync category when URL changes (back/forward, router.push)
  useEffect(() => {
    setCategoryParam(new URLSearchParams(window.location.search).get('category'));
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      setCategoryParam(new URLSearchParams(window.location.search).get('category'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Data
  const [result, setResult] = useState<PaginatedResponse<TalentProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [openToWork, setOpenToWork] = useState(false);
  const [page, setPage] = useState(1);

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [zone, setZone] = useState('');
  const [minExperience, setMinExperience] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Detail dialog
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Proposal form
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalRole, setProposalRole] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalAvailability, setProposalAvailability] = useState('');
  const [sendingProposal, setSendingProposal] = useState(false);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [categoryParam]);

  const loadProfiles = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params: Record<string, any> = { page, limit: 18 };
      if (search) params.search = search;
      if (availability !== 'all') params.availability = availability;
      if (openToWork) params.openToWork = true;
      // Category filter: use category field if available, otherwise search by specialty terms
      if (categoryParam && CATEGORY_SEARCH_TERMS[categoryParam]) {
        params.category = categoryParam;
      }
      // Advanced filters
      if (zone) params.zone = zone;
      if (minExperience !== 'all') params.minExperience = parseInt(minExperience);
      if (skillsFilter) params.skills = skillsFilter;
      if (sortBy !== 'recent') params.sortBy = sortBy;
      const data = await api.browseTalent(params);
      setResult(data);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los perfiles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, page, search, availability, openToWork, categoryParam, zone, minExperience, skillsFilter, sortBy]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce zone
  const [zoneInput, setZoneInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setZone(zoneInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [zoneInput]);

  // Debounce skills
  const [skillsInput, setSkillsInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkillsFilter(skillsInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [skillsInput]);

  const handleAvailabilityChange = (val: string) => {
    setAvailability(val);
    setPage(1);
  };

  const handleOpenToWorkChange = (val: boolean) => {
    setOpenToWork(val);
    setPage(1);
  };

  const handleMinExperienceChange = (val: string) => {
    setMinExperience(val);
    setPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };

  // Count active advanced filters
  const advancedFilterCount = [
    zone,
    minExperience !== 'all',
    skillsFilter,
    sortBy !== 'recent',
  ].filter(Boolean).length;

  const clearAdvancedFilters = () => {
    setZoneInput('');
    setZone('');
    setMinExperience('all');
    setSkillsInput('');
    setSkillsFilter('');
    setSortBy('recent');
    setPage(1);
  };

  const openProfileDetail = async (profile: TalentProfile) => {
    setSelectedProfile(profile);
    setDetailOpen(true);
    // Load full profile
    if (!session?.accessToken) return;
    setLoadingDetail(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const full = await api.getTalentProfile(profile.id);
      setSelectedProfile(full);
    } catch {
      // Already have basic data
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSendProposal = async () => {
    if (!session?.accessToken || !selectedProfile || !proposalRole || !proposalMessage) return;
    setSendingProposal(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.sendProposal(selectedProfile.id, {
        role: proposalRole,
        message: proposalMessage,
        availability: proposalAvailability || undefined,
      });
      toast({ title: 'Propuesta enviada', description: `Tu propuesta fue enviada a ${selectedProfile.name}` });
      setShowProposalForm(false);
      setProposalRole('');
      setProposalMessage('');
      setProposalAvailability('');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo enviar la propuesta', variant: 'destructive' });
    } finally {
      setSendingProposal(false);
    }
  };

  const profiles = result?.data || [];
  const meta = result?.meta;

  const availabilityLabel = (val: string | null) => {
    switch (val) {
      case 'full-time': return 'Jornada completa';
      case 'part-time': return 'Medio turno';
      case 'freelance': return 'Independiente';
      default: return val;
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="rounded-lg bg-white/20 p-2 shrink-0">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-3xl">
                {categoryParam && CATEGORY_LABELS[categoryParam]
                  ? CATEGORY_LABELS[categoryParam]
                  : 'Explorar talento'}
              </h1>
              <p className="hidden sm:block mt-0.5 sm:mt-1 text-sm sm:text-base text-teal-100">Encontra profesionales para tu negocio</p>
            </div>
          </div>
          {meta && (
            <div className="rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center shrink-0">
              <div className="text-lg sm:text-2xl font-bold">{meta.total}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Perfiles</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => { setCategoryParam(null); router.push('/talento'); }}
          className={`shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            !categoryParam
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.key}
            categoryKey={cat.key}
            compact
            selected={categoryParam === cat.key}
            onClick={() => { setCategoryParam(cat.key); router.push(`/talento?category=${cat.key}`); }}
          />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          {/* Row 1: Search + basic filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especialidad..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-3 items-center">
              <Select value={availability} onValueChange={handleAvailabilityChange}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="full-time">Jornada completa</SelectItem>
                  <SelectItem value="part-time">Medio turno</SelectItem>
                  <SelectItem value="freelance">Independiente</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  id="openToWork"
                  checked={openToWork}
                  onCheckedChange={handleOpenToWorkChange}
                />
                <Label htmlFor="openToWork" className="whitespace-nowrap text-xs sm:text-sm cursor-pointer">
                  Abiertos
                  <span className="hidden sm:inline"> a propuestas</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Advanced filters toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-medium"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filtros avanzados
              {advancedFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {advancedFilterCount}
                </span>
              )}
            </Button>
            {advancedFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAdvancedFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Advanced filters panel */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t">
              {/* Zone/Location filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Zona / Ubicación
                </Label>
                <Input
                  placeholder="Ej: Palermo, Lanús, CABA..."
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Minimum experience */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Experiencia mínima
                </Label>
                <Select value={minExperience} onValueChange={handleMinExperienceChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    <SelectItem value="1">1+ año</SelectItem>
                    <SelectItem value="2">2+ años</SelectItem>
                    <SelectItem value="3">3+ años</SelectItem>
                    <SelectItem value="5">5+ años</SelectItem>
                    <SelectItem value="10">10+ años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Habilidad
                </Label>
                <Input
                  placeholder="Ej: colorimetría, corte..."
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Sort by */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  Ordenar por
                </Label>
                <Select value={sortBy} onValueChange={handleSortByChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="experience">Mayor experiencia</SelectItem>
                    <SelectItem value="name">Nombre (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full border-l-4 border-l-gray-200 dark:border-l-gray-700">
              <CardContent className="p-4 sm:p-5 flex flex-col h-full animate-pulse">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 space-y-2.5">
                  <div className="h-6 w-24 rounded-full bg-muted" />
                  <div className="flex gap-1.5">
                    <div className="h-6 w-16 rounded-full bg-muted" />
                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-auto pt-3 sm:pt-4">
                  <div className="border-t pt-2.5 sm:pt-3">
                    <div className="h-9 w-full rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No se encontraron perfiles</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta con otros filtros o vuelve más tarde
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className={`group cursor-pointer transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.98] h-full border-l-4 ${profile.category && CATEGORY_CARD_ACCENTS[profile.category] ? CATEGORY_CARD_ACCENTS[profile.category] : 'border-l-gray-200 dark:border-l-gray-700'}`}
                onClick={() => openProfileDetail(profile)}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    {profile.image ? (
                      <div className="h-11 w-11 sm:h-12 sm:w-12 aspect-square rounded-full overflow-hidden shrink-0 bg-muted">
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 sm:h-12 sm:w-12 aspect-square items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0">
                        {getInitials(profile.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-[15px]">{profile.name}</h3>
                      {profile.headline && (
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-2.5">
                    {profile.specialty && (
                      <Badge variant="secondary" className="text-[11px] h-6 px-2.5">
                        {profile.specialty}
                      </Badge>
                    )}

                    {profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-[11px] h-6 px-2.5">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-[11px] h-6 px-2.5 text-muted-foreground">
                            +{profile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                      {profile.yearsExperience != null && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {profile.yearsExperience} años
                        </span>
                      )}
                      {profile.availability && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {availabilityLabel(profile.availability)}
                        </span>
                      )}
                      {profile.preferredZones?.length > 0 && (
                        <span className="flex items-center gap-1 truncate max-w-[150px]" title={profile.preferredZones.join(', ')}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          {profile.preferredZones.slice(0, 2).join(', ')}
                          {profile.preferredZones.length > 2 && ` +${profile.preferredZones.length - 2}`}
                        </span>
                      )}
                    </div>

                    {profile.openToWork && (
                      <Badge className="text-[11px] h-6 px-2.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                        <UserCheck className="mr-1 h-3 w-3" />
                        Disponible
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto pt-3 sm:pt-4">
                    <div className="border-t pt-2.5 sm:pt-3">
                      <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/5 h-9">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-10 px-3 sm:px-4"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {meta.page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-10 px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Profile Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setShowProposalForm(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85dvh] sm:max-h-[85vh] flex flex-col !p-0 !gap-0 overflow-hidden">
          {selectedProfile && (
            <>
              {loadingDetail ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="overflow-y-auto flex-1 min-h-0">
                    <ProfileHeader profile={selectedProfile} />

                    {/* Proposal form fields (scrollable) */}
                    {showProposalForm && (
                      <div className="px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-sm sm:text-base">Enviar propuesta a {selectedProfile.name}</h4>
                        <div>
                          <Label htmlFor="proposalRole" className="text-sm">Rol o servicio *</Label>
                          <Input
                            id="proposalRole"
                            placeholder="Ej: Estilista, Masajista, Barbero..."
                            value={proposalRole}
                            onChange={(e) => setProposalRole(e.target.value)}
                            className="mt-1 h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="proposalMessage" className="text-sm">Mensaje *</Label>
                          <Textarea
                            id="proposalMessage"
                            placeholder="Contale sobre tu negocio y por que te interesa su perfil..."
                            value={proposalMessage}
                            onChange={(e) => setProposalMessage(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="proposalAvailability" className="text-sm">Disponibilidad</Label>
                          <Select
                            value={proposalAvailability}
                            onValueChange={setProposalAvailability}
                          >
                            <SelectTrigger className="mt-1 h-10">
                              <SelectValue placeholder="Seleccionar (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Jornada completa</SelectItem>
                              <SelectItem value="part-time">Medio turno</SelectItem>
                              <SelectItem value="freelance">Independiente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proposal action buttons — sticky at bottom, always visible */}
                  <div className="border-t px-4 sm:px-6 py-4 shrink-0 bg-background">
                    {!showProposalForm ? (
                      <Button
                        className="w-full h-11"
                        onClick={() => setShowProposalForm(true)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar propuesta
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-11"
                          onClick={() => setShowProposalForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 h-11"
                          disabled={!proposalRole || !proposalMessage || sendingProposal}
                          onClick={handleSendProposal}
                        >
                          {sendingProposal ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Enviar
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default function TalentoPage() {
  return <TalentoContent />;
}
