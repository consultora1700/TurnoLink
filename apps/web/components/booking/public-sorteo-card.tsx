'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Users, Gift, Loader2, AlertCircle, CheckCircle2, Sparkles, Clock, ChevronRight, Instagram } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PublicSorteoCardProps {
  sorteo: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    prizes: string;
    drawDate?: string;
    _count: { participants: number };
  };
  tenantSlug: string;
  instagramHandle?: string | null;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <Clock className="h-3.5 w-3.5" />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.mins}m
      </span>
    </div>
  );
}

const shimmerKeyframes = `
@keyframes sorteo-shimmer {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(200%) rotate(25deg); }
}
@keyframes sorteo-cta-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
}
`;

export function PublicSorteoCard({ sorteo, tenantSlug, instagramHandle }: PublicSorteoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [igFollowed, setIgFollowed] = useState(false);
  const [igClicked, setIgClicked] = useState(false);

  const igUser = instagramHandle?.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || '';
  const igUrl = igUser ? `https://instagram.com/${igUser}` : '';

  let prizes: Array<{ name: string; color?: string }> = [];
  try { prizes = JSON.parse(sorteo.prizes); } catch {}

  const participantCount = sorteo._count.participants;
  const hasDrawDate = sorteo.drawDate && new Date(sorteo.drawDate).getTime() > Date.now();

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const url = `${API_URL}/api/public/tenants/${tenantSlug}/sorteos/${sorteo.id}/register`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
          }),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        if (fetchErr.name === 'AbortError') {
          throw new Error('La solicitud tardó demasiado. Intentá de nuevo.');
        }
        throw new Error('No se pudo conectar con el servidor. Verificá tu conexión a internet.');
      }
      clearTimeout(timeout);

      if (!res.ok) {
        let errMsg = 'Error al registrarse';
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errMsg;
        } catch {}

        if (res.status === 400 && errMsg.toLowerCase().includes('ya')) {
          setError('Ya estás participando en este sorteo.');
        } else if (res.status === 404) {
          setError('Este sorteo ya no está disponible.');
        } else if (res.status >= 500) {
          setError('Error del servidor. Intentá de nuevo en unos minutos.');
        } else {
          setError(errMsg);
        }
        setSubmitting(false);
        return;
      }

      setRegistered(true);
      toast({ title: '¡Ya estás participando!' });
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado. Intentá de nuevo.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      {/* ─── Sorteo Card ─── */}
      <div
        className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        onClick={() => { setModalOpen(true); setError(''); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') { setModalOpen(true); setError(''); } }}
      >
        {/* Gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 dark:from-amber-500 dark:via-yellow-400 dark:to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden">
          {/* Shimmer sweep */}
          <div
            className="absolute inset-0 w-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
              animation: 'sorteo-shimmer 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Inner card */}
        <div className="relative rounded-[calc(1rem-1px)] overflow-hidden bg-white dark:bg-neutral-900">
          {/* Header gradient strip */}
          <div className="relative h-24 sm:h-28 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 dark:from-amber-500 dark:via-yellow-500 dark:to-orange-500 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/10" />
            </div>

            {/* Sparkle accents */}
            <Sparkles className="absolute top-3 right-3 h-5 w-5 text-white/60 animate-pulse" />

            {/* Trophy + Badge */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
              <div className="h-11 w-11 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center mb-1.5 shadow-lg shadow-amber-600/20">
                <Trophy className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.15em]">
                Sorteo exclusivo
              </span>
            </div>

            {/* Participant count badge */}
            {participantCount > 0 && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm text-white text-[10px] font-semibold">
                <Users className="h-3 w-3" />
                {participantCount}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-4 pt-4 pb-3">
            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-2">
              {sorteo.title}
            </h3>

            {/* Description */}
            {sorteo.description && (
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                {sorteo.description}
              </p>
            )}

            {/* Prizes */}
            {prizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {prizes.slice(0, 3).map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: p.color || '#f59e0b' }}
                  >
                    <Gift className="h-2.5 w-2.5" />
                    {p.name}
                  </span>
                ))}
                {prizes.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                    +{prizes.length - 3} más
                  </span>
                )}
              </div>
            )}

            {/* Countdown */}
            {hasDrawDate && (
              <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                <CountdownTimer targetDate={sorteo.drawDate!} />
              </div>
            )}

            {/* CTA */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Participar gratis
              </span>
              <div
                className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:shadow-lg group-hover:shadow-amber-500/40 transition-shadow"
                style={{ animation: 'sorteo-cta-pulse 2.5s ease-in-out infinite' }}
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Registration Modal ─── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Modal header with gradient */}
          <div className="relative bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 px-6 pt-7 pb-5 text-center overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-6 w-20 h-20 rounded-full bg-white/10" />
            <Sparkles className="absolute top-4 right-4 h-5 w-5 text-white/50" />

            <div className="relative z-10">
              <div className="h-14 w-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-lg">
                {registered
                  ? <CheckCircle2 className="h-7 w-7 text-white" />
                  : <Trophy className="h-7 w-7 text-white" />
                }
              </div>
              <h2 className="text-lg font-bold text-white">
                {registered ? '¡Ya estás participando!' : sorteo.title}
              </h2>
              {!registered && participantCount > 0 && (
                <p className="text-white/80 text-xs mt-1.5 flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  {participantCount} {participantCount === 1 ? 'persona inscripta' : 'personas inscriptas'}
                </p>
              )}
            </div>
          </div>

          {registered ? (
            <div className="text-center px-6 py-8">
              <p className="text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
                Te avisaremos si ganás. ¡Mucha suerte!
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold text-sm hover:from-amber-500 hover:to-orange-500 transition-all shadow-md"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="px-6 pt-4 pb-6 space-y-4">
              {/* Prizes showcase */}
              {prizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {prizes.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                      style={{ backgroundColor: p.color || '#f59e0b' }}
                    >
                      <Gift className="h-3 w-3" />
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Instagram follow step */}
              {igUrl && (
                <div className="rounded-xl border border-pink-200 dark:border-pink-800/40 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-orange-950/20 p-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-neutral-200">
                      Seguí a <span className="text-pink-600 dark:text-pink-400">@{igUser}</span> para participar
                    </p>
                  </div>
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { setIgClicked(true); if (!igFollowed) setTimeout(() => setIgFollowed(true), 2000); }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-xs font-bold transition-all active:scale-[0.97]"
                    style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                  >
                    <Instagram className="h-4 w-4" />
                    {igClicked ? 'Abrir Instagram' : 'Seguir en Instagram'}
                  </a>
                  {igClicked && !igFollowed && (
                    <p className="text-[10px] text-center text-slate-400 dark:text-neutral-500 mt-2 animate-pulse">
                      Seguilo y volvé acá...
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Tu nombre completo"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Teléfono *</Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="11 1234-5678"
                    className="h-10"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-400 dark:text-neutral-500">Email (opcional)</Label>
                  <Input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="h-10"
                    type="email"
                  />
                </div>
              </div>

              {/* Instagram confirmation checkbox */}
              {igUrl && (
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${igFollowed ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-pink-500' : 'border-slate-300 dark:border-neutral-600 group-hover:border-pink-400'}`}>
                    {igFollowed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span
                    className={`text-xs leading-relaxed transition-colors ${igFollowed ? 'text-slate-700 dark:text-neutral-200' : 'text-slate-400 dark:text-neutral-500'}`}
                    onClick={() => setIgFollowed(!igFollowed)}
                  >
                    Ya sigo a <span className="font-semibold text-pink-600 dark:text-pink-400">@{igUser}</span> en Instagram
                  </span>
                </label>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !form.name.trim() || !form.phone.trim() || (!!igUrl && !igFollowed)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-sm hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                ¡Quiero participar!
              </button>

              <p className="text-[10px] text-center text-slate-400 dark:text-neutral-600">
                Participación gratuita. Sin compromiso.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
