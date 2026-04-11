'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientesFidelizacionPage() {
  const { data: session } = useSession();
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadBalances = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const data = await api.get(`/loyalty/balances?${params}`);
      setBalances(data);
    } catch {}
    setLoading(false);
  }, [session?.accessToken, page, search]);

  useEffect(() => { loadBalances(); }, [loadBalances]);

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Clientes con puntos</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, telefono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Telefono</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Ganados</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Canjeados</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : !balances?.data?.length ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay clientes con puntos</td></tr>
                ) : (
                  balances.data.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <Link href={`/fidelizacion/clientes/${item.customer.id}`} className="font-medium hover:underline">
                          {item.customer.name}
                        </Link>
                        <p className="text-xs text-muted-foreground sm:hidden">{item.customer.phone}</p>
                      </td>
                      <td className="p-3 text-sm hidden sm:table-cell">{item.customer.phone}</td>
                      <td className="p-3 text-sm text-right">{item.totalEarned}</td>
                      <td className="p-3 text-sm text-right">{item.totalRedeemed}</td>
                      <td className="p-3 text-right">
                        <Badge variant={item.currentBalance > 0 ? 'default' : 'secondary'}>{item.currentBalance}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {balances?.meta && balances.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {balances.meta.page} de {balances.meta.totalPages} ({balances.meta.total} total)
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= balances.meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
