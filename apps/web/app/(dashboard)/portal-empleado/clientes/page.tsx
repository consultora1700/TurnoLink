'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Loader2,
  User,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

interface ClientSummary {
  id: string;
  name: string;
  phone: string | null;
  createdAt: string;
  _count: { bookings: number };
}

interface ClientDetail {
  id: string;
  name: string;
  phone: string | null;
  createdAt: string;
  bookings: any[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No asistió',
};

export default function ClientesPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const data = await api.employeePortal.getClients();
      setClients(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openClientDetail = async (clientId: string) => {
    if (!session?.accessToken) return;
    setDetailLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const data = await api.employeePortal.getClient(clientId);
      setSelectedClient(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredClients = searchTerm
    ? clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
      )
    : clients;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Clientes</h1>
        <p className="text-muted-foreground text-sm mt-1">Clientes que reservaron turnos con vos</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{clients.length} cliente{clients.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg mb-1">
              {searchTerm ? 'Sin resultados' : 'Sin clientes'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm
                ? 'Probá con otro término de búsqueda'
                : 'Cuando los clientes reserven turnos con vos, aparecerán acá'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openClientDetail(client.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{client.name}</p>
                    {client.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {client.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {client._count.bookings} turno{client._count.bookings !== 1 ? 's' : ''}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : selectedClient && (
            <div className="space-y-4">
              {/* Contact */}
              <div className="space-y-2">
                {selectedClient.phone && (
                  <a
                    href={`tel:${selectedClient.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4" /> {selectedClient.phone}
                  </a>
                )}
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Cliente desde {new Date(selectedClient.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Booking History */}
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  Historial de turnos ({selectedClient.bookings.length})
                </h3>
                {selectedClient.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin turnos registrados</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedClient.bookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                        <div>
                          <p className="font-medium">{booking.service?.name || 'Servicio'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(booking.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            {booking.startTime && ` · ${booking.startTime.substring(0, 5)}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
