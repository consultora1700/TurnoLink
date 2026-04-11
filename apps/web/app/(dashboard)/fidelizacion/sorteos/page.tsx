'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, Users, CalendarDays } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Completado', color: 'bg-blue-100 text-blue-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function SorteosFidelizacionPage() {
  const { data: session } = useSession();
  const [sorteos, setSorteos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSorteos = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.get('/loyalty/sorteos');
      setSorteos(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch {}
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { loadSorteos(); }, [loadSorteos]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sorteos</h1>
        <Link href="/fidelizacion/sorteos/nuevo" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo sorteo
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2].map(i => <div key={i} className="h-40 animate-pulse bg-muted rounded-lg" />)}
        </div>
      ) : sorteos.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2" />
          <p>No hay sorteos creados. Crea tu primer sorteo.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorteos.map(sorteo => {
            const status = statusConfig[sorteo.status] || { label: sorteo.status, color: 'bg-gray-100 text-gray-800' };
            let prizes: any[] = [];
            try { prizes = JSON.parse(sorteo.prizes || '[]'); } catch {}
            return (
              <Link key={sorteo.id} href={`/fidelizacion/sorteos/${sorteo.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{sorteo.title}</h3>
                        {sorteo.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{sorteo.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {prizes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prizes.slice(0, 3).map((p: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{p.name}</Badge>
                        ))}
                        {prizes.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{prizes.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {sorteo._count?.participants ?? 0} participantes
                      </span>
                      {sorteo.drawDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(sorteo.drawDate).toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
