'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Search, Send, Loader2, Users } from 'lucide-react';

export default function CuponesFidelizacionPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchCustomers = useCallback(async () => {
    if (!session?.accessToken || !search || search.length < 2) {
      setCustomers([]);
      return;
    }
    setSearching(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params = new URLSearchParams({ search, limit: '10' });
      const data = await api.get(`/customers?${params}`);
      setCustomers(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch {}
    setSearching(false);
  }, [session?.accessToken, search]);

  useEffect(() => {
    const timeout = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeout);
  }, [searchCustomers]);

  const handleSubmit = async () => {
    if (!session?.accessToken || !selectedCustomer || !points || !description) return;
    setSubmitting(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.post('/loyalty/points/adjust', {
        customerId: selectedCustomer.id,
        points: Number(points),
        description,
      });
      toast({ title: 'Puntos ajustados correctamente' });
      setSelectedCustomer(null);
      setPoints(0);
      setDescription('');
      setSearch('');
    } catch {
      toast({ title: 'Error al ajustar puntos', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Cupones manuales</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> Ajustar puntos de un cliente
          </CardTitle>
          <CardDescription>Suma o resta puntos manualmente. Usa valores negativos para restar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedCustomer ? (
            <div className="space-y-2">
              <Label>Buscar cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, telefono o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searching && <p className="text-sm text-muted-foreground">Buscando...</p>}
              {customers.length > 0 && (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {customers.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCustomer(c); setSearch(''); setCustomers([]); }}
                      className="w-full text-left p-3 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone} {c.email ? `- ${c.email}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
              {search.length >= 2 && !searching && customers.length === 0 && (
                <p className="text-sm text-muted-foreground">No se encontraron clientes</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-primary hover:underline">Cambiar</button>
              </div>

              <div className="space-y-2">
                <Label>Puntos a sumar/restar</Label>
                <Input
                  type="number"
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  placeholder="Ej: 50 o -20"
                />
                <p className="text-xs text-muted-foreground">Usa valores negativos para restar puntos</p>
              </div>

              <div className="space-y-2">
                <Label>Descripcion / Motivo</Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: Bonificacion por inconveniente"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !points || !description}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {points >= 0 ? 'Sumar puntos' : 'Restar puntos'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
