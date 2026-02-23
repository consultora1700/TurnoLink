'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, TalentProposal } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mail,
  Phone,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary', icon: Clock },
  ACCEPTED: { label: 'Aceptada', variant: 'default', icon: CheckCircle },
  REJECTED: { label: 'Rechazada', variant: 'destructive', icon: XCircle },
  EXPIRED: { label: 'Expirada', variant: 'outline', icon: Clock },
};

export default function PropuestasPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<TalentProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<TalentProposal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      loadProposals();
    }
  }, [session?.accessToken]);

  const loadProposals = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getProposalsSent();
      setProposals(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las propuestas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const countByStatus = (status: string) => proposals.filter((p) => p.status === status).length;

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
              <h1 className="text-xl font-bold sm:text-3xl">Mis propuestas</h1>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-teal-100">Propuestas enviadas a profesionales</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{proposals.length}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Total</div>
            </div>
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{countByStatus('ACCEPTED')}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Aceptadas</div>
            </div>
            <div className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-center">
              <div className="text-lg sm:text-2xl font-bold">{countByStatus('PENDING')}</div>
              <div className="text-[10px] sm:text-xs text-teal-100">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando propuestas...</p>
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <Send className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">No enviaste propuestas aún</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora perfiles profesionales y envía tu primera propuesta
            </p>
            <Button className="mt-4 h-11" onClick={() => window.location.href = '/talento'}>
              Explorar talento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {proposals.map((proposal) => {
            const config = statusConfig[proposal.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            return (
              <Card
                key={proposal.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
                onClick={() => { setSelectedProposal(proposal); setDetailOpen(true); }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Professional avatar */}
                      {proposal.profile?.image ? (
                        <img
                          src={proposal.profile.image}
                          alt={proposal.profile.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0">
                          {proposal.profile ? getInitials(proposal.profile.name) : '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[15px] truncate">{proposal.profile?.name || 'Profesional'}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {proposal.profile?.specialty && (
                            <span>{proposal.profile.specialty} · </span>
                          )}
                          <span className="font-medium">{proposal.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-[52px] sm:ml-0 shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(proposal.createdAt)}</span>
                      <Badge variant={config.variant} className="text-xs whitespace-nowrap">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {proposal.status === 'ACCEPTED' && (
                    <div className="mt-2.5 sm:mt-3 space-y-2">
                      {proposal.responseMessage && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2.5 sm:p-3 text-sm">
                          <MessageSquare className="inline h-3 w-3 mr-1 text-green-600" />
                          <span className="text-green-800 dark:text-green-300 line-clamp-2">{proposal.responseMessage}</span>
                        </div>
                      )}
                      {(proposal.profile?.email || proposal.profile?.phone) && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2.5 sm:p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                          {proposal.profile.email && (
                            <a href={`mailto:${proposal.profile.email}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                              <Mail className="h-3 w-3" />
                              {proposal.profile.email}
                            </a>
                          )}
                          {proposal.profile?.phone && (
                            <a href={`tel:${proposal.profile.phone}`} className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 hover:underline">
                              <Phone className="h-3 w-3" />
                              {proposal.profile.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          {selectedProposal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Detalle de propuesta</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 mt-2">
                {/* Professional */}
                <div className="flex items-center gap-3">
                  {selectedProposal.profile?.image ? (
                    <img
                      src={selectedProposal.profile.image}
                      alt={selectedProposal.profile.name}
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0">
                      {selectedProposal.profile ? getInitials(selectedProposal.profile.name) : '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{selectedProposal.profile?.name}</div>
                    {selectedProposal.profile?.specialty && (
                      <div className="text-sm text-muted-foreground truncate">{selectedProposal.profile.specialty}</div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Rol o servicio</span>
                    <p className="mt-0.5">{selectedProposal.role}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Mensaje</span>
                    <p className="whitespace-pre-line mt-0.5 leading-relaxed">{selectedProposal.message}</p>
                  </div>
                  {selectedProposal.availability && (
                    <div>
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Disponibilidad</span>
                      <p className="mt-0.5">{selectedProposal.availability}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Fecha de envío</span>
                    <p className="mt-0.5">{formatDate(selectedProposal.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Estado</span>
                    <div className="mt-1">
                      {(() => {
                        const config = statusConfig[selectedProposal.status] || statusConfig.PENDING;
                        const StatusIcon = config.icon;
                        return (
                          <Badge variant={config.variant} className="text-xs">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  {selectedProposal.responseMessage && (
                    <div>
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Respuesta del profesional</span>
                      <p className="whitespace-pre-line mt-1 p-2.5 sm:p-3 rounded-lg bg-muted leading-relaxed">{selectedProposal.responseMessage}</p>
                    </div>
                  )}
                  {selectedProposal.status === 'ACCEPTED' && (selectedProposal.profile?.email || selectedProposal.profile?.phone) && (
                    <div>
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Datos de contacto</span>
                      <div className="mt-1.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
                        {selectedProposal.profile.email && (
                          <a href={`mailto:${selectedProposal.profile.email}`} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
                            <Mail className="h-4 w-4 shrink-0" />
                            {selectedProposal.profile.email}
                          </a>
                        )}
                        {selectedProposal.profile?.phone && (
                          <a href={`tel:${selectedProposal.profile.phone}`} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline">
                            <Phone className="h-4 w-4 shrink-0" />
                            {selectedProposal.profile.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedProposal.respondedAt && (
                    <div>
                      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Fecha de respuesta</span>
                      <p className="mt-0.5">{formatDate(selectedProposal.respondedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
