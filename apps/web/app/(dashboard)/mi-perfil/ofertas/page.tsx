'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, JobPosting } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ZoneAutocomplete } from '@/components/ui/zone-autocomplete';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Briefcase,
  Search,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
  'estetica-belleza': 'Estética y Belleza',
  'barberia': 'Barbería',
  'peluqueria': 'Peluquería',
  'spa-masajes': 'Spa y Masajes',
  'fitness-deporte': 'Fitness y Deporte',
  'salud-bienestar': 'Salud y Bienestar',
  'gastronomia': 'Gastronomía',
  'educacion-capacitacion': 'Educación',
  'consultoria': 'Consultoría',
  'tecnologia': 'Tecnología',
  'servicios-profesionales': 'Servicios Prof.',
  'otros': 'Otros',
};

const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'estetica-belleza', label: 'Estética y Belleza' },
  { value: 'barberia', label: 'Barbería' },
  { value: 'peluqueria', label: 'Peluquería' },
  { value: 'spa-masajes', label: 'Spa y Masajes' },
  { value: 'fitness-deporte', label: 'Fitness y Deporte' },
  { value: 'salud-bienestar', label: 'Salud y Bienestar' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'educacion-capacitacion', label: 'Educación' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicios-profesionales', label: 'Servicios Prof.' },
  { value: 'otros', label: 'Otros' },
];

const availabilityLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'freelance': 'Freelance',
};

const salaryPeriodLabels: Record<string, string> = {
  monthly: '/mes',
  hourly: '/hora',
  project: '/proyecto',
};

export default function BrowseOfertasPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [zone, setZone] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Apply dialog
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyAvailability, setApplyAvailability] = useState('');
  const [applying, setApplying] = useState(false);

  const loadPostings = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params: Record<string, string> = {
        page: String(page),
        limit: '20',
        sortBy,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (availability) params.availability = availability;
      if (zone) params.zone = zone;

      const result = await api.browseJobPostings(params);
      setPostings(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las ofertas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, page, search, category, availability, zone, sortBy]);

  useEffect(() => {
    loadPostings();
  }, [loadPostings]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => { setPage(1); }, 400));
  };

  const handleApply = async () => {
    if (!session?.accessToken || !selectedPosting || !applyMessage.trim()) return;
    setApplying(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.applyToJobPosting(selectedPosting.id, {
        message: applyMessage.trim(),
        availability: applyAvailability || undefined,
      });
      toast({ title: 'Postulación enviada', description: 'El negocio recibirá tu postulación' });
      setDetailOpen(false);
      setApplyMessage('');
      setApplyAvailability('');
      loadPostings();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo enviar la postulación', variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string, period: string | null) => {
    const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n);
    let range = '';
    if (min && max) range = `${fmt(min)} - ${fmt(max)}`;
    else if (min) range = `Desde ${fmt(min)}`;
    else if (max) range = `Hasta ${fmt(max)}`;
    else return null;
    return `${currency} ${range}${period ? ` ${salaryPeriodLabels[period] || ''}` : ''}`;
  };

  const daysUntilDeadline = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-lg bg-white/20 p-2 shrink-0">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-3xl">Ofertas laborales</h1>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-teal-100">Encuentra oportunidades que se ajusten a tu perfil</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={category || 'all'} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value || 'all'} value={cat.value || 'all'}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availability} onValueChange={(v) => { setAvailability(v === 'all' ? '' : v); setPage(1); }}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              <ZoneAutocomplete
                values={zone ? [zone] : []}
                onChange={(zones) => { setZone(zones.length > 0 ? zones[zones.length - 1] : ''); setPage(1); }}
                placeholder="Buscar zona..."
              />
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="salary">Mayor salario</SelectItem>
                  <SelectItem value="deadline">Deadline próximo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Buscando ofertas...</p>
        </div>
      ) : postings.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <Briefcase className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">No hay ofertas disponibles</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta cambiar los filtros o vuelve más tarde
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {postings.map((posting) => {
              const salary = formatSalary(posting.salaryMin, posting.salaryMax, posting.salaryCurrency, posting.salaryPeriod);
              const skills = posting.requiredSkills || [];
              return (
                <Card
                  key={posting.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
                  onClick={() => { setSelectedPosting(posting); setDetailOpen(true); setApplyMessage(''); setApplyAvailability(''); }}
                >
                  <CardContent className="p-4">
                    {/* Business info */}
                    <div className="flex items-center gap-2 mb-3">
                      {posting.tenant?.logo ? (
                        <img src={posting.tenant.logo} alt={posting.tenant.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{posting.tenant?.name || 'Negocio'}</div>
                        {posting.tenant?.city && (
                          <div className="text-xs text-muted-foreground">{posting.tenant.city}</div>
                        )}
                      </div>
                    </div>

                    {/* Title + badges */}
                    <h3 className="font-semibold text-[15px] line-clamp-2 mb-2">{posting.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {categoryLabels[posting.category] || posting.category}
                      </Badge>
                      {posting.availability && (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {availabilityLabels[posting.availability] || posting.availability}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {posting.zone && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{posting.zone}</span>
                        </div>
                      )}
                      {posting.minExperience != null && posting.minExperience > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{posting.minExperience}+ años experiencia</span>
                        </div>
                      )}
                      {salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 shrink-0" />
                          <span>{salary}</span>
                        </div>
                      )}
                      {posting.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>
                            {daysUntilDeadline(posting.deadline) > 0
                              ? `${daysUntilDeadline(posting.deadline)} días restantes`
                              : 'Último día'
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal">{skill}</Badge>
                        ))}
                        {skills.length > 5 && (
                          <Badge variant="secondary" className="text-[10px] font-normal">+{skills.length - 5}</Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      {posting.hasApplied ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ya postulado
                        </Badge>
                      ) : (
                        <Button size="sm" className="h-7 text-xs">
                          Ver detalle
                        </Button>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {posting.applicationCount || 0} postulaciones
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail + Apply Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          {selectedPosting && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{selectedPosting.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Business */}
                <div className="flex items-center gap-2">
                  {selectedPosting.tenant?.logo ? (
                    <img src={selectedPosting.tenant.logo} alt={selectedPosting.tenant.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white">
                      <Building2 className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{selectedPosting.tenant?.name}</div>
                    {selectedPosting.tenant?.city && (
                      <div className="text-xs text-muted-foreground">{selectedPosting.tenant.city}</div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[selectedPosting.category] || selectedPosting.category}
                  </Badge>
                  {selectedPosting.availability && (
                    <Badge variant="secondary" className="text-xs">
                      {availabilityLabels[selectedPosting.availability] || selectedPosting.availability}
                    </Badge>
                  )}
                  {selectedPosting.zone && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedPosting.zone}
                    </Badge>
                  )}
                  {selectedPosting.minExperience != null && selectedPosting.minExperience > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {selectedPosting.minExperience}+ años exp.
                    </Badge>
                  )}
                </div>

                {/* Salary */}
                {(() => {
                  const salary = formatSalary(selectedPosting.salaryMin, selectedPosting.salaryMax, selectedPosting.salaryCurrency, selectedPosting.salaryPeriod);
                  return salary ? (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm font-medium text-green-800 dark:text-green-300">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      {salary}
                    </div>
                  ) : null;
                })()}

                {/* Description */}
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Descripción</Label>
                  <p className="mt-1 text-sm whitespace-pre-line leading-relaxed">{selectedPosting.description}</p>
                </div>

                {/* Skills */}
                {selectedPosting.requiredSkills && selectedPosting.requiredSkills.length > 0 && (
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Habilidades requeridas</Label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedPosting.requiredSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadline */}
                {selectedPosting.deadline && (
                  <div className="text-sm text-muted-foreground">
                    <Calendar className="inline h-3.5 w-3.5 mr-1" />
                    Fecha límite: {new Date(selectedPosting.deadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}

                {/* Apply form */}
                {selectedPosting.hasApplied ? (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium">Ya te postulaste a esta oferta</p>
                    <p className="text-xs text-muted-foreground mt-1">Podés ver el estado en "Mis postulaciones"</p>
                  </div>
                ) : (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-sm">Postularme</h4>
                    <div className="space-y-1.5">
                      <Label>Mensaje de presentación *</Label>
                      <Textarea
                        placeholder="Contá por qué sos ideal para este puesto, tu experiencia relevante..."
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        rows={4}
                        maxLength={2000}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tu disponibilidad (opcional)</Label>
                      <Select value={applyAvailability} onValueChange={setApplyAvailability}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleApply}
                      disabled={!applyMessage.trim() || applying}
                      className="w-full"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-1.5" />
                      )}
                      Enviar postulación
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
