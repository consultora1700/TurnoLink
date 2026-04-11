'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrizeWheel } from '@/components/loyalty/prize-wheel';
import { SorteoWinnerModal } from '@/components/loyalty/sorteo-winner-modal';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Users, CalendarDays, Trophy, Gift, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  COMPLETED: { label: 'Completado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const prizeLabels = ['1er Premio', '2do Premio', '3er Premio', '4to Premio', '5to Premio', '6to Premio', '7mo Premio', '8vo Premio'];

interface DrawnPrize {
  index: number;
  name: string;
  color?: string;
  drawn: boolean;
  winner: { id: string; name: string; phone: string; email?: string } | null;
}

export default function SorteoDetallePage() {
  const { data: session } = useSession();
  const params = useParams();
  const sorteoId = params.id as string;
  const [sorteo, setSorteo] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [currentWinner, setCurrentWinner] = useState<any>(null);
  const [currentPrize, setCurrentPrize] = useState('');
  const [currentPrizeLabel, setCurrentPrizeLabel] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [drawing, setDrawing] = useState(false);

  // Multi-prize state
  const [drawnPrizes, setDrawnPrizes] = useState<DrawnPrize[]>([]);
  const [nextPrizeIndex, setNextPrizeIndex] = useState(0);
  const [allDrawn, setAllDrawn] = useState(false);

  const loadSorteo = useCallback(async () => {
    if (!session?.accessToken || !sorteoId) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const [sorteoData, participantsData, drawStatus] = await Promise.all([
        api.get(`/loyalty/sorteos/${sorteoId}`),
        api.get(`/loyalty/sorteos/${sorteoId}/participants`),
        api.get(`/loyalty/sorteos/${sorteoId}/draw-status`).catch(() => null),
      ]);
      setSorteo(sorteoData);
      setParticipants(Array.isArray(participantsData) ? participantsData : (participantsData as any)?.data || []);
      if (drawStatus) {
        const ds = drawStatus as any;
        setDrawnPrizes(ds.drawnPrizes || []);
        setNextPrizeIndex(ds.nextPrizeIndex >= 0 ? ds.nextPrizeIndex : 0);
        setAllDrawn(ds.allDrawn || false);
      }
    } catch {}
    setLoading(false);
  }, [session?.accessToken, sorteoId]);

  useEffect(() => { loadSorteo(); }, [loadSorteo]);

  let prizes: Array<{ name: string; color: string; weight?: number }> = [];
  try { prizes = JSON.parse(sorteo?.prizes || '[]'); } catch {}

  const handleForceSelected = async (force: number) => {
    if (!session?.accessToken || !sorteoId || drawing || allDrawn) return;
    if (participants.length === 0) {
      toast({ title: 'No hay participantes', variant: 'destructive' });
      return;
    }
    setDrawing(true);
    // Clear previous winner info so it doesn't show during spin
    setCurrentWinner(null);
    setCurrentPrize('');
    try {
      const api = createApiClient(session.accessToken as string);
      const result = await api.post<any>(`/loyalty/sorteos/${sorteoId}/draw`, {
        prizeIndex: nextPrizeIndex,
      });
      const prizeIdx = result.prizeIndex ?? nextPrizeIndex;
      setWinnerIndex(prizeIdx);
      // Store winner data but DON'T show it yet — wait for spin to end
      setCurrentWinner(result.winner);
      setCurrentPrize(result.prizeName || prizes[prizeIdx]?.name || 'Premio');
      setCurrentPrizeLabel(prizeLabels[prizeIdx] || `Premio ${prizeIdx + 1}`);
      setSpinning(true);
    } catch (err: any) {
      toast({ title: err?.message || 'Error al sortear', variant: 'destructive' });
      setDrawing(false);
    }
  };

  const handleSpinEnd = () => {
    setSpinning(false);
    setDrawing(false);
    // NOW show the winner modal — only after the wheel stops
    setShowWinnerModal(true);
    loadSorteo();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-violet-100 dark:border-violet-900" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-violet-600 dark:border-t-violet-400 animate-spin" />
      </div>
      <p className="text-muted-foreground">Cargando sorteo...</p>
    </div>
  );

  if (!sorteo) return <div className="py-16 text-center text-muted-foreground">No se encontro el sorteo</div>;

  const status = statusConfig[sorteo.status] || { label: sorteo.status, color: 'bg-gray-100 text-gray-800' };
  const canSpin = sorteo.status === 'ACTIVE' && participants.length > 0 && !allDrawn;
  const hasAnyWinner = drawnPrizes.some(p => p.drawn) || currentWinner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/fidelizacion" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold flex-1 truncate">{sorteo.title}</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Info + Prize Tracker + Participants */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <CardHeader><CardTitle className="text-sm">Informacion</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sorteo.description && <p className="text-sm text-muted-foreground">{sorteo.description}</p>}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />{participants.length} participantes
                </span>
                {sorteo.drawDate && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />{new Date(sorteo.drawDate).toLocaleDateString('es-AR', { dateStyle: 'long' })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prize tracker — shows status of each prize */}
          {prizes.length > 0 && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Premios del sorteo</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {prizes.map((prize, i) => {
                  const drawn = drawnPrizes.find(d => d.index === i);
                  const isDrawn = drawn?.drawn;
                  const isNext = i === nextPrizeIndex && !allDrawn && sorteo.status === 'ACTIVE';
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isDrawn
                          ? 'bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/30'
                          : isNext
                            ? 'bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 shadow-sm'
                            : 'bg-muted/30 border border-border/30'
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: prize.color || '#888' }}
                      >
                        {isDrawn ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {prizeLabels[i] || `Premio ${i + 1}`}
                          </span>
                          {isNext && !spinning && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full animate-pulse">
                              SIGUIENTE
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">{prize.name}</p>
                      </div>
                      {isDrawn && drawn?.winner && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">{drawn.winner.name}</p>
                          <p className="text-[10px] text-muted-foreground">{drawn.winner.phone}</p>
                        </div>
                      )}
                      {!isDrawn && !isNext && (
                        <span className="text-xs text-muted-foreground">Pendiente</span>
                      )}
                    </div>
                  );
                })}
                {allDrawn && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/30 text-center">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Todos los premios fueron sorteados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Participantes</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Telefono</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Premio</th>
                  </tr></thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sin participantes</td></tr>
                    ) : participants.map((p: any) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 text-sm font-medium">
                          {p.name}
                          {p.isWinner && <Badge className="ml-2 text-[10px]" variant="default">Ganador</Badge>}
                        </td>
                        <td className="px-3 py-2 text-sm hidden sm:table-cell">{p.phone}</td>
                        <td className="px-3 py-2 text-sm hidden sm:table-cell text-muted-foreground">{p.email || '-'}</td>
                        <td className="px-3 py-2 text-sm text-right">
                          {p.wonPrize ? (
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                              {p.wonPrize}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              {new Date(p.registeredAt || p.createdAt).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Wheel */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm overflow-hidden sticky top-6">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Ruleta</span>
                {canSpin && !spinning && !drawing && prizes[nextPrizeIndex] && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Sorteando: {prizeLabels[nextPrizeIndex] || `Premio ${nextPrizeIndex + 1}`}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrizeWheel
                prizes={prizes}
                winnerIndex={winnerIndex}
                onSpinEnd={handleSpinEnd}
                spinning={spinning}
                onForceSelected={handleForceSelected}
                showForceBar={canSpin && !drawing}
                disabled={!canSpin || drawing}
              />

              {/* Reopen winner modal button — only show when NOT spinning and there are drawn prizes */}
              {!spinning && !drawing && hasAnyWinner && (
                <div className="mt-4 space-y-2">
                  {drawnPrizes.filter(p => p.drawn).map((dp) => (
                    <button
                      key={dp.index}
                      onClick={() => {
                        if (dp.winner) {
                          setCurrentWinner(dp.winner);
                          setCurrentPrize(dp.name);
                          setCurrentPrizeLabel(prizeLabels[dp.index] || `Premio ${dp.index + 1}`);
                          setShowWinnerModal(true);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: dp.color || '#f59e0b' }}>
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{prizeLabels[dp.index] || `Premio ${dp.index + 1}`}: {dp.name}</p>
                        <p className="text-sm font-bold truncate">{dp.winner?.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">Ver</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SorteoWinnerModal
        open={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        winner={currentWinner}
        prize={currentPrize}
        prizeLabel={currentPrizeLabel}
      />
    </div>
  );
}
