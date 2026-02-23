'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, TalentProposal } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
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
  Inbox,
  Loader2,
  Check,
  X,
  Clock,
  Building2,
  Briefcase,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Expirada',
};

const statusVariants: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function MiPerfilPropuestasPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [proposals, setProposals] = useState<TalentProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Respond dialog
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<TalentProposal | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  const loadProposals = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getMyProposals();
      setProposals(data);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las propuestas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const openRespondDialog = (proposal: TalentProposal, action: 'ACCEPTED' | 'REJECTED') => {
    setSelectedProposal({ ...proposal, status: action });
    setResponseMessage('');
    setRespondDialogOpen(true);
  };

  const handleRespond = async () => {
    if (!session?.accessToken || !selectedProposal) return;
    setResponding(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.respondToMyProposal(selectedProposal.id, {
        status: selectedProposal.status,
        responseMessage: responseMessage || undefined,
      });
      toast({
        title: selectedProposal.status === 'ACCEPTED' ? 'Propuesta aceptada' : 'Propuesta rechazada',
      });
      setRespondDialogOpen(false);
      loadProposals();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo responder', variant: 'destructive' });
    } finally {
      setResponding(false);
    }
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2 shrink-0">
              <Inbox className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-3xl">Propuestas Recibidas</h1>
              <p className="mt-0.5 text-sm sm:text-base text-teal-100">
                Revisa y responde las propuestas de negocios
              </p>
            </div>
          </div>
          {proposals.length > 0 && (
            <div className="rounded-lg bg-white/20 px-3 py-1.5 text-center">
              <div className="text-xl font-bold">{proposals.filter((p) => p.status === 'PENDING').length}</div>
              <div className="text-xs text-teal-100">Pendientes</div>
            </div>
          )}
        </div>
      </div>

      {/* Proposals list */}
      {proposals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay propuestas</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cuando un negocio te envie una propuesta, la veras aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold">{proposal.senderTenant?.name || 'Negocio'}</span>
                      </div>
                      <Badge className={`text-[11px] h-6 ${statusVariants[proposal.status]}`}>
                        {statusLabels[proposal.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{proposal.role}</span>
                    </div>

                    <div className="flex items-start gap-1.5 mt-2">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-3">{proposal.message}</p>
                    </div>

                    {proposal.availability && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">{proposal.availability}</span>
                      </div>
                    )}

                    {proposal.responseMessage && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Tu respuesta:</p>
                        <p className="text-sm">{proposal.responseMessage}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(proposal.createdAt).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {proposal.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => openRespondDialog(proposal, 'ACCEPTED')}
                      >
                        <Check className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Aceptar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openRespondDialog(proposal, 'REJECTED')}
                      >
                        <X className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Rechazar</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Respond Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProposal?.status === 'ACCEPTED' ? 'Aceptar propuesta' : 'Rechazar propuesta'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProposal?.status === 'ACCEPTED' ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium mb-1">Al aceptar, se compartirán tus datos de contacto</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      El negocio podrá ver tu email y teléfono para contactarte directamente.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Vas a rechazar la propuesta. Podés incluir un mensaje opcional.
              </p>
            )}
            <div className="space-y-2">
              <Label>Mensaje <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  selectedProposal?.status === 'ACCEPTED'
                    ? 'Ej: Me interesa mucho, pueden contactarme en cualquier horario...'
                    : 'Ej: Gracias por la propuesta, pero no estoy disponible...'
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRespondDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleRespond}
              disabled={responding}
              variant={selectedProposal?.status === 'ACCEPTED' ? 'default' : 'destructive'}
            >
              {responding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {selectedProposal?.status === 'ACCEPTED' ? 'Aceptar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
