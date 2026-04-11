'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  ACTIVE: { label: 'Activo', variant: 'default' },
  USED: { label: 'Usado', variant: 'secondary' },
  EXPIRED: { label: 'Expirado', variant: 'destructive' },
};

export default function CanjesFidelizacionPage() {
  const { data: session } = useSession();
  const [redemptions, setRedemptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadRedemptions = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      const data = await api.get(`/loyalty/redemptions?${params}`);
      setRedemptions(data);
    } catch {}
    setLoading(false);
  }, [session?.accessToken, page]);

  useEffect(() => { loadRedemptions(); }, [loadRedemptions]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historial de canjes</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Recompensa</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Puntos</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Codigo</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">Estado</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : !redemptions?.data?.length ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Ticket className="h-8 w-8 mx-auto mb-2" />
                    No hay canjes registrados
                  </td></tr>
                ) : (
                  redemptions.data.map((item: any) => {
                    const status = statusConfig[item.status] || { label: item.status, variant: 'secondary' as const };
                    return (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium text-sm">{item.customer?.name || '-'}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{item.reward?.name}</p>
                        </td>
                        <td className="p-3 text-sm hidden sm:table-cell">{item.reward?.name || '-'}</td>
                        <td className="p-3 text-sm text-right font-medium">{item.pointsSpent}</td>
                        <td className="p-3 text-sm hidden md:table-cell">
                          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{item.couponCode}</code>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="p-3 text-sm text-right text-muted-foreground hidden sm:table-cell">
                          {new Date(item.createdAt).toLocaleDateString('es-AR')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {redemptions?.meta && redemptions.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {redemptions.meta.page} de {redemptions.meta.totalPages} ({redemptions.meta.total} total)
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= redemptions.meta.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
