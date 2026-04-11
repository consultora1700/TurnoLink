'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, JobApplication } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Send,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Mail,
  Phone,
  Undo2,
  Briefcase,
  MessageSquare,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary', icon: Clock },
  REVIEWED: { label: 'Vista', variant: 'outline', icon: Eye },
  ACCEPTED: { label: 'Aceptada', variant: 'default', icon: CheckCircle },
  REJECTED: { label: 'Rechazada', variant: 'destructive', icon: XCircle },
  WITHDRAWN: { label: 'Retirada', variant: 'outline', icon: Undo2 },
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

export default function MisPostulacionesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (session?.accessToken) loadApplications();
  }, [session?.accessToken]);

  const loadApplications = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getMyJobApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las postulaciones', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!session?.accessToken || !confirmWithdraw) return;
    setWithdrawingId(confirmWithdraw.id);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.withdrawJobApplication(confirmWithdraw.id);
      toast({ title: 'Postulación retirada' });
      setConfirmWithdraw(null);
      loadApplications();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo retirar', variant: 'destructive' });
    } finally {
      setWithdrawingId(null);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  const countByStatus = (status: string) => applications.filter((a) => a.status === status).length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 shrink-0">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-3xl">Mis postulaciones</h1>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-teal-100">Seguí el estado de tus postulaciones</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{countByStatus('PENDING') + countByStatus('REVIEWED')}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Pendientes</div>
            </div>
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{countByStatus('ACCEPTED')}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Aceptadas</div>
            </div>
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{countByStatus('REJECTED')}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Rechazadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando postulaciones...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <Briefcase className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">No tienes postulaciones</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora ofertas laborales y postulate a las que coincidan con tu perfil
            </p>
            <Button className="mt-4 h-11" onClick={() => window.location.href = '/mi-perfil/ofertas'}>
              <Briefcase className="h-4 w-4 mr-1.5" />
              Ver ofertas
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {applications.map((app) => {
            const config = statusConfig[app.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            const isPending = app.status === 'PENDING' || app.status === 'REVIEWED';
            const posting = app.posting;

            return (
              <Card key={app.id} className="transition-all hover:shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Business avatar */}
                      {posting?.tenant?.logo ? (
                        <img src={posting.tenant.logo} alt={posting.tenant.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[15px] truncate">{posting?.title || 'Oferta'}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {posting?.tenant?.name}
                          {posting?.category && (
                            <span> · {categoryLabels[posting.category] || posting.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-[52px] sm:ml-0 shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(app.createdAt)}</span>
                      <Badge variant={config.variant} className="text-xs whitespace-nowrap">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Response message */}
                  {app.responseMessage && (
                    <div className="mt-2.5 ml-[52px] sm:ml-0 rounded-lg bg-muted p-2.5 sm:p-3 text-sm">
                      <MessageSquare className="inline h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="line-clamp-2">{app.responseMessage}</span>
                    </div>
                  )}

                  {/* Contact info (only for accepted) */}
                  {app.status === 'ACCEPTED' && posting?.tenant && (
                    (posting.tenant as any).email || (posting.tenant as any).phone
                  ) && (
                    <div className="mt-2.5 ml-[52px] sm:ml-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2.5 sm:p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                      {(posting!.tenant as any).email && (
                        <a href={`mailto:${(posting!.tenant as any).email}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                          <Mail className="h-3 w-3" />
                          {(posting!.tenant as any).email}
                        </a>
                      )}
                      {(posting!.tenant as any).phone && (
                        <a href={`tel:${(posting!.tenant as any).phone}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                          <Phone className="h-3 w-3" />
                          {(posting!.tenant as any).phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Withdraw button */}
                  {isPending && (
                    <div className="mt-2.5 ml-[52px] sm:ml-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => setConfirmWithdraw(app)}
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Retirar postulación
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirm Withdraw Dialog */}
      <Dialog open={!!confirmWithdraw} onOpenChange={(open) => { if (!open) setConfirmWithdraw(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Retirar postulación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que querés retirar tu postulación a &quot;{confirmWithdraw?.posting?.title}&quot;? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmWithdraw(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={withdrawingId === confirmWithdraw?.id}
            >
              {withdrawingId === confirmWithdraw?.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4 mr-1" />
              )}
              Retirar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
