'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createApiClient, JobPosting } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Plus,
  Loader2,
  MapPin,
  Clock,
  Users,
  Pause,
  Play,
  Eye,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  OPEN: { label: 'Abierta', variant: 'default' },
  PAUSED: { label: 'Pausada', variant: 'secondary' },
  CLOSED: { label: 'Cerrada', variant: 'outline' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
};

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

export default function OfertasLaboralesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) loadPostings();
  }, [session?.accessToken]);

  const loadPostings = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getMyJobPostings();
      setPostings(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las ofertas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (posting: JobPosting, newStatus: string) => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateJobPosting(posting.id, { status: newStatus });
      toast({ title: newStatus === 'PAUSED' ? 'Oferta pausada' : 'Oferta reabierta' });
      loadPostings();
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar la oferta', variant: 'destructive' });
    }
  };

  const countByStatus = (status: string) => postings.filter((p) => p.status === status).length;
  const pendingApps = postings.reduce((sum, p) => sum + (p.applicationCount || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 shrink-0">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-3xl">Ofertas laborales</h1>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-teal-100">Publica ofertas y recibe postulaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
                <div className="text-lg sm:text-2xl font-bold">{countByStatus('OPEN')}</div>
                <div className="text-[10px] sm:text-xs text-teal-100">Abiertas</div>
              </div>
              <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
                <div className="text-lg sm:text-2xl font-bold">{pendingApps}</div>
                <div className="text-[10px] sm:text-xs text-teal-100">Postulaciones</div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/talento/ofertas/nueva')}
              className="bg-white text-teal-700 hover:bg-teal-50 h-10 sm:h-11"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Nueva oferta</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando ofertas...</p>
        </div>
      ) : postings.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <Briefcase className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">No tienes ofertas aún</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Publica tu primera oferta laboral para recibir postulaciones de profesionales
            </p>
            <Button className="mt-4 h-11" onClick={() => router.push('/talento/ofertas/nueva')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Publicar primera oferta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {postings.map((posting) => {
            const config = statusConfig[posting.status] || statusConfig.OPEN;
            return (
              <Card
                key={posting.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
                onClick={() => router.push(`/talento/ofertas/${posting.id}`)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[15px] truncate">{posting.title}</h3>
                        <Badge variant={config.variant} className="text-xs shrink-0">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
                        <Badge variant="outline" className="text-xs font-normal">
                          {categoryLabels[posting.category] || posting.category}
                        </Badge>
                        {posting.zone && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {posting.zone}
                          </span>
                        )}
                        {posting.minExperience != null && posting.minExperience > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {posting.minExperience}+ años
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-medium">{posting.applicationCount || 0}</span>
                        <span className="hidden sm:inline">postulaciones</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); router.push(`/talento/ofertas/${posting.id}`); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {posting.status === 'OPEN' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(posting, 'PAUSED'); }}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {posting.status === 'PAUSED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(posting, 'OPEN'); }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
