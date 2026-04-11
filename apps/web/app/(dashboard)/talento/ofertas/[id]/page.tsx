'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { createApiClient, JobPosting, JobApplication } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Lock,
  Mail,
  Phone,
  Eye,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  OPEN: { label: 'Abierta', variant: 'default' },
  PAUSED: { label: 'Pausada', variant: 'secondary' },
  CLOSED: { label: 'Cerrada', variant: 'outline' },
};

const appStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary' },
  REVIEWED: { label: 'Vista', variant: 'outline' },
  ACCEPTED: { label: 'Aceptada', variant: 'default' },
  REJECTED: { label: 'Rechazada', variant: 'destructive' },
  WITHDRAWN: { label: 'Retirada', variant: 'outline' },
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

export default function OfertaDetallePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const postingId = params.id as string;

  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingApp, setRespondingApp] = useState<JobApplication | null>(null);
  const [respondStatus, setRespondStatus] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (session?.accessToken && postingId) {
      loadData();
    }
  }, [session?.accessToken, postingId]);

  const loadData = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const [postingData, appsData] = await Promise.all([
        api.getMyJobPosting(postingId),
        api.getJobApplications(postingId),
      ]);
      setPosting(postingData);
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la oferta', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus: string) => {
    if (!session?.accessToken || !posting) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateJobPosting(posting.id, { status: newStatus });
      toast({ title: newStatus === 'PAUSED' ? 'Oferta pausada' : newStatus === 'CLOSED' ? 'Oferta cerrada' : 'Oferta reabierta' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  const handleRespond = async () => {
    if (!session?.accessToken || !respondingApp || !posting) return;
    setResponding(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.respondToJobApplication(posting.id, respondingApp.id, {
        status: respondStatus,
        responseMessage: responseMessage.trim() || undefined,
      });
      toast({
        title: respondStatus === 'ACCEPTED' ? 'Postulante aceptado' : 'Postulante rechazado',
        description: respondStatus === 'ACCEPTED'
          ? 'Se le envió un email con los datos de contacto'
          : 'Se le notificó al profesional',
      });
      setRespondingApp(null);
      setResponseMessage('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo responder', variant: 'destructive' });
    } finally {
      setResponding(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatSalary = (min: number | null, max: number | null, currency: string, period: string | null) => {
    const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n);
    let range = '';
    if (min && max) range = `${fmt(min)} - ${fmt(max)}`;
    else if (min) range = `Desde ${fmt(min)}`;
    else if (max) range = `Hasta ${fmt(max)}`;
    else return null;
    return `${currency} ${range}${period ? ` ${salaryPeriodLabels[period] || ''}` : ''}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando oferta...</p>
      </div>
    );
  }

  if (!posting) {
    return (
      <div className="text-center py-16">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Oferta no encontrada</h3>
        <Button className="mt-4" onClick={() => router.push('/talento/ofertas')}>
          Volver a ofertas
        </Button>
      </div>
    );
  }

  const config = statusConfig[posting.status] || statusConfig.OPEN;
  const salary = formatSalary(posting.salaryMin, posting.salaryMax, posting.salaryCurrency, posting.salaryPeriod);
  const skills: string[] = posting.requiredSkills || [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Back link */}
      <button
        onClick={() => router.push('/talento/ofertas')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a ofertas
      </button>

      {/* Posting Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{posting.title}</h1>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-xs font-normal">
                  {categoryLabels[posting.category] || posting.category}
                </Badge>
                {posting.availability && (
                  <span>{availabilityLabels[posting.availability] || posting.availability}</span>
                )}
                {posting.zone && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {posting.zone}
                  </span>
                )}
                {posting.minExperience != null && posting.minExperience > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {posting.minExperience}+ años experiencia
                  </span>
                )}
                {salary && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {salary}
                  </span>
                )}
                {posting.deadline && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Cierra {formatDate(posting.deadline)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {posting.status === 'OPEN' && (
                <Button size="sm" variant="outline" onClick={() => handleToggleStatus('PAUSED')}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
              )}
              {posting.status === 'PAUSED' && (
                <Button size="sm" variant="outline" onClick={() => handleToggleStatus('OPEN')}>
                  <Play className="h-4 w-4 mr-1" />
                  Reabrir
                </Button>
              )}
              {posting.status !== 'CLOSED' && (
                <Button size="sm" variant="destructive" onClick={() => handleToggleStatus('CLOSED')}>
                  <Lock className="h-4 w-4 mr-1" />
                  Cerrar
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 text-sm whitespace-pre-line leading-relaxed text-muted-foreground">
            {posting.description}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            Postulaciones ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">Aún no hay postulaciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const appConfig = appStatusConfig[app.status] || appStatusConfig.PENDING;
                const isPending = app.status === 'PENDING' || app.status === 'REVIEWED';
                return (
                  <div key={app.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {app.profile?.image ? (
                          <img src={app.profile.image} alt={app.profile.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0">
                            {app.profile ? getInitials(app.profile.name) : '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[15px] truncate">{app.profile?.name || 'Profesional'}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {app.profile?.specialty && <span>{app.profile.specialty} · </span>}
                            {app.profile?.category && <span>{categoryLabels[app.profile.category] || app.profile.category}</span>}
                            {app.profile?.yearsExperience != null && <span> · {app.profile.yearsExperience} años exp.</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-[52px] sm:ml-0 shrink-0">
                        <span className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</span>
                        <Badge variant={appConfig.variant} className="text-xs">{appConfig.label}</Badge>
                      </div>
                    </div>

                    {/* Skills */}
                    {app.profile?.skills && app.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-[52px] sm:ml-0">
                        {app.profile.skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] font-normal">{skill}</Badge>
                        ))}
                        {app.profile.skills.length > 5 && (
                          <Badge variant="outline" className="text-[11px] font-normal">+{app.profile.skills.length - 5}</Badge>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <div className="ml-[52px] sm:ml-0 text-sm text-muted-foreground">
                      <p className="line-clamp-3">{app.message}</p>
                    </div>

                    {/* Contact info (only for ACCEPTED) */}
                    {app.status === 'ACCEPTED' && (app.profile?.email || app.profile?.phone) && (
                      <div className="ml-[52px] sm:ml-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                        {app.profile.email && (
                          <a href={`mailto:${app.profile.email}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                            <Mail className="h-3 w-3" />
                            {app.profile.email}
                          </a>
                        )}
                        {app.profile.phone && (
                          <a href={`tel:${app.profile.phone}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                            <Phone className="h-3 w-3" />
                            {app.profile.phone}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Response message */}
                    {app.responseMessage && (
                      <div className="ml-[52px] sm:ml-0 rounded-lg bg-muted p-3 text-sm">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tu respuesta</span>
                        <p className="mt-1">{app.responseMessage}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {isPending && (
                      <div className="ml-[52px] sm:ml-0 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setRespondingApp(app);
                            setRespondStatus('ACCEPTED');
                            setResponseMessage('');
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingApp(app);
                            setRespondStatus('REJECTED');
                            setResponseMessage('');
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={!!respondingApp} onOpenChange={(open) => { if (!open) setRespondingApp(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {respondStatus === 'ACCEPTED' ? 'Aceptar postulante' : 'Rechazar postulante'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {respondStatus === 'ACCEPTED'
                ? `Se le enviará un email a ${respondingApp?.profile?.name} con los datos de contacto de tu negocio.`
                : `Se le notificará a ${respondingApp?.profile?.name} que no fue seleccionado/a.`
              }
            </p>
            <div className="space-y-1.5">
              <Label>Mensaje (opcional)</Label>
              <Textarea
                placeholder={respondStatus === 'ACCEPTED'
                  ? 'Ej: Nos encantó tu perfil, contactanos para coordinar una entrevista...'
                  : 'Ej: Gracias por postularte, en este momento buscamos otro perfil...'
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondingApp(null)}>Cancelar</Button>
            <Button
              onClick={handleRespond}
              disabled={responding}
              variant={respondStatus === 'ACCEPTED' ? 'default' : 'destructive'}
            >
              {responding ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : respondStatus === 'ACCEPTED' ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              {respondStatus === 'ACCEPTED' ? 'Aceptar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
