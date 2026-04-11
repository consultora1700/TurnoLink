'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trophy, Gift, Phone, Mail, MessageCircle } from 'lucide-react';
import { playWinnerFanfare } from './prize-wheel';

interface SorteoWinnerModalProps {
  open: boolean;
  onClose: () => void;
  winner: { name: string; phone: string; email?: string } | null;
  prize: string;
  prizeLabel?: string;
}

export function SorteoWinnerModal({ open, onClose, winner, prize, prizeLabel }: SorteoWinnerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  const startConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth * 2;
    canvas.height = parent.clientHeight * 2;
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `${parent.clientHeight}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    const colors = [
      '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
      '#ec4899', '#f97316', '#14b8a6', '#fbbf24', '#a855f7',
    ];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; rotSpeed: number;
      shape: 'rect' | 'circle' | 'streamer' | 'star'; life: number; maxLife: number;
      opacity: number;
    }> = [];

    // Burst from center top
    for (let i = 0; i < 220; i++) {
      const shape = i < 70 ? 'rect' : i < 130 ? 'circle' : i < 180 ? 'streamer' : 'star';
      const angle = (Math.random() * Math.PI) + Math.PI; // upward burst
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 60,
        y: -10 - Math.random() * 40,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: shape === 'streamer' ? Math.random() * 4 + 2 : shape === 'star' ? Math.random() * 5 + 4 : Math.random() * 8 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape,
        life: 0,
        maxLife: 300 + Math.random() * 250,
        opacity: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      particles.forEach(p => {
        p.life++;
        if (p.life > p.maxLife) return;
        alive = true;
        p.x += p.vx + Math.sin(frame * 0.015 + p.rotation) * 0.8;
        p.y += p.vy;
        p.vy += 0.035;
        p.rotation += p.rotSpeed;
        p.vx *= 0.995;
        const fadeStart = p.maxLife * 0.75;
        p.opacity = p.life > fadeStart ? 1 - (p.life - fadeStart) / (p.maxLife - fadeStart) : 1;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
        } else {
          ctx.fillRect(-1.5, -p.size * 3, 3, p.size * 6);
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(startConfetti, 100);
      setTimeout(() => playWinnerFanfare(), 200);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [open, startConfetti]);

  const whatsappUrl = winner?.phone
    ? `https://wa.me/${winner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `🏆 ¡Felicitaciones ${winner.name}! Ganaste "${prize}" en nuestro sorteo. ¡Contactanos para coordinar la entrega de tu premio!`
      )}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 border-0 shadow-2xl">
        {/* Golden top accent */}
        <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        <div className="relative z-0 px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          {/* Trophy icon with glow */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/25 rounded-full blur-2xl animate-pulse scale-[2]" />
              <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-xl animate-pulse scale-[1.6]" style={{ animationDelay: '0.3s' }} />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/40 ring-4 ring-yellow-200/40 dark:ring-yellow-800/30">
                <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            ¡Tenemos ganador!
          </h2>
          {prizeLabel && (
            <p className="text-center text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">{prizeLabel}</p>
          )}
          <p className="text-center text-sm text-muted-foreground mb-6">El sorteo ha finalizado</p>

          {winner && (
            <div className="space-y-4">
              {/* Winner name card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700/40 p-5 text-center shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Ganador/a</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground mb-3">{winner.name}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {winner.phone}
                  </span>
                  {winner.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {winner.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Prize card */}
              {prize && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-800/30 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Premio</p>
                      <p className="text-xl font-bold text-foreground">{prize}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm transition-all shadow-lg shadow-green-500/20 inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Avisar por WhatsApp
                  </a>
                )}
                <button
                  onClick={onClose}
                  className={`${whatsappUrl ? 'flex-shrink-0 w-auto px-6' : 'flex-1'} h-12 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-foreground font-semibold text-sm transition-all border border-slate-200/60 dark:border-slate-600/40 inline-flex items-center justify-center`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}
