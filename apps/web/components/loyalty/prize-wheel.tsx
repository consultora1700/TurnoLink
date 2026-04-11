'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Prize {
  name: string;
  color: string;
  weight?: number;
}

interface PrizeWheelProps {
  prizes: Prize[];
  winnerIndex?: number | null;
  onSpinEnd?: () => void;
  spinning?: boolean;
  onForceSelected?: (force: number) => void;
  showForceBar?: boolean;
  disabled?: boolean;
}

// ── Haptic helpers ──
function vibrate(ms: number | number[]) {
  try { navigator?.vibrate?.(ms); } catch {}
}

// ── Sound helpers (Web Audio API, no files needed) ──
let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
  }
  return audioCtx;
}

function playTick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 800 + Math.random() * 400;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

function playChargeStart() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

function playLaunch() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
  osc.type = 'triangle';
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playWinnerFanfare() {
  const ctx = getAudioCtx();
  if (!ctx) return;

  // Triumphant arpeggio: C5 → E5 → G5 → C6 (staccato) then sustained C major chord
  const arpNotes = [523, 659, 784, 1047];
  arpNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'triangle';
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });

  // Sustained triumph chord after arpeggio (C5+E5+G5+C6)
  const chordStart = ctx.currentTime + 0.55;
  const chordNotes = [523, 659, 784, 1047];
  chordNotes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, chordStart);
    gain.gain.setValueAtTime(0.1, chordStart + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.8);
    osc.start(chordStart);
    osc.stop(chordStart + 1.8);
  });

  // Sparkle high notes
  const sparkles = [2093, 2637, 3136];
  sparkles.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    const t = chordStart + 0.2 + i * 0.18;
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  try {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  } catch { return [0, 50, 50]; }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function PrizeWheel({
  prizes, winnerIndex, onSpinEnd, spinning,
  onForceSelected, showForceBar = true, disabled = false,
}: PrizeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [canvasSize, setCanvasSize] = useState(380);
  const animationRef = useRef<number>();
  const idleAnimRef = useRef<number>();
  const spinStartRef = useRef(0);
  const startRotationRef = useRef(0);
  const totalRotationRef = useRef(0);
  const durationRef = useRef(5000);
  const lastTickSegRef = useRef(-1);

  // Force bar state
  const [holdState, setHoldState] = useState<'idle' | 'waiting' | 'charging'>('idle');
  const [force, setForce] = useState(0);
  const chargeRef = useRef<number>();
  const chargeStartRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Idle
  const [idleOffset, setIdleOffset] = useState(0);
  const idleTimeRef = useRef(0);

  const HOLD_DELAY = 600; // ms before charge starts

  // Responsive size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setCanvasSize(Math.min(Math.max(w, 260), 440));
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Idle breathing
  useEffect(() => {
    if (spinning) return;
    const animate = (time: number) => {
      if (!idleTimeRef.current) idleTimeRef.current = time;
      const elapsed = time - idleTimeRef.current;
      setIdleOffset(Math.sin(elapsed / 1500) * 0.025);
      idleAnimRef.current = requestAnimationFrame(animate);
    };
    idleAnimRef.current = requestAnimationFrame(animate);
    return () => { if (idleAnimRef.current) cancelAnimationFrame(idleAnimRef.current); };
  }, [spinning]);

  // ── Tick sound during spin ──
  useEffect(() => {
    if (!spinning || prizes.length === 0) { lastTickSegRef.current = -1; return; }
    const segAngle = (2 * Math.PI) / prizes.length;
    const normalRot = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const currentSeg = Math.floor(normalRot / segAngle);
    if (currentSeg !== lastTickSegRef.current && lastTickSegRef.current !== -1) {
      playTick();
      vibrate(8);
    }
    lastTickSegRef.current = currentSeg;
  }, [rotation, spinning, prizes.length]);

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, size: number, rot: number) => {
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const center = size / 2;
    const outerRadius = center - 16;
    const innerRadius = outerRadius - 8;
    const segmentAngle = (2 * Math.PI) / prizes.length;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    // Outer metallic ring
    const ringGrad = ctx.createRadialGradient(center, center, innerRadius, center, center, outerRadius + 4);
    ringGrad.addColorStop(0, '#c0c0c0');
    ringGrad.addColorStop(0.3, '#e8e8e8');
    ringGrad.addColorStop(0.6, '#b0b0b0');
    ringGrad.addColorStop(1, '#888');
    ctx.beginPath();
    ctx.arc(center, center, outerRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = ringGrad;
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.arc(center, center, outerRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Tick marks
    ctx.save();
    ctx.translate(center, center);
    for (let i = 0; i < prizes.length; i++) {
      const angle = i * segmentAngle + rot;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -(innerRadius + 2));
      ctx.lineTo(0, -(outerRadius + 2));
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Wheel base
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();

    // Segments
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rot);

    prizes.forEach((prize, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerRadius, startAngle, endAngle);
      ctx.closePath();

      const [h, s, l] = hexToHsl(prize.color || '#888');
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
      grad.addColorStop(0, `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.min(l + 15, 85)}%)`);
      grad.addColorStop(0.7, prize.color || '#888');
      grad.addColorStop(1, `hsl(${h}, ${s}%, ${Math.max(l - 12, 15)}%)`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      const fontSize = Math.max(10, Math.min(14, innerRadius / (prizes.length > 6 ? 10 : 8)));
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      const maxLen = prizes.length > 6 ? 12 : 16;
      const text = prize.name.length > maxLen ? prize.name.substring(0, maxLen) + '…' : prize.name;
      ctx.fillText(text, innerRadius - 18, 0);
      ctx.shadowColor = 'transparent';
      ctx.restore();
    });
    ctx.restore();

    // Center hub
    const hubR = innerRadius * 0.16;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(center, center, hubR, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(center, center - 3, 0, center, center, hubR);
    hubGrad.addColorStop(0, '#fff');
    hubGrad.addColorStop(0.4, '#f0f0f0');
    hubGrad.addColorStop(1, '#bbb');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(center, center, hubR * 0.45, 0, Math.PI * 2);
    const dotGrad = ctx.createRadialGradient(center, center - 2, 0, center, center, hubR * 0.45);
    dotGrad.addColorStop(0, '#ddd');
    dotGrad.addColorStop(1, '#aaa');
    ctx.fillStyle = dotGrad;
    ctx.fill();

    // Pointer
    const ptrW = 16, ptrH = 30;
    const ptrX = center, ptrY = center - innerRadius - 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.moveTo(ptrX, ptrY + ptrH);
    ctx.lineTo(ptrX - ptrW, ptrY - 2);
    ctx.quadraticCurveTo(ptrX, ptrY - 8, ptrX + ptrW, ptrY - 2);
    ctx.closePath();
    const ptrGrad = ctx.createLinearGradient(ptrX - ptrW, ptrY, ptrX + ptrW, ptrY + ptrH);
    ptrGrad.addColorStop(0, '#ff3333');
    ptrGrad.addColorStop(0.5, '#ee1111');
    ptrGrad.addColorStop(1, '#cc0000');
    ctx.fillStyle = ptrGrad;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }, [prizes]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWheel(ctx, canvasSize, rotation + idleOffset);
  }, [rotation, idleOffset, drawWheel, canvasSize]);

  // Spin animation
  useEffect(() => {
    if (!spinning || winnerIndex == null || prizes.length === 0) return;

    playLaunch();
    vibrate([30, 50, 30]);

    const segmentAngle = (2 * Math.PI) / prizes.length;
    const targetAngle = -(winnerIndex * segmentAngle + segmentAngle / 2);
    const forceMultiplier = 8 + (force || 0.5) * 14;
    const fullRotations = forceMultiplier * 2 * Math.PI;
    const normalizedCurrent = rotation % (2 * Math.PI);
    const totalRotation = fullRotations + targetAngle - normalizedCurrent;
    const duration = 6000 + (force || 0.5) * 8000;

    startRotationRef.current = rotation;
    totalRotationRef.current = totalRotation;
    spinStartRef.current = performance.now();
    durationRef.current = duration;

    const animate = (time: number) => {
      const elapsed = time - spinStartRef.current;
      const progress = Math.min(elapsed / durationRef.current, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startRotationRef.current + totalRotationRef.current * eased;
      setRotation(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        vibrate([50, 30, 50, 30, 100]);
        playWinnerFanfare();
        onSpinEnd?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winnerIndex]);

  // Force bar charging (starts after hold delay)
  useEffect(() => {
    if (holdState !== 'charging') return;
    chargeStartRef.current = performance.now();
    const animate = (time: number) => {
      const elapsed = time - chargeStartRef.current;
      const cycle = (elapsed % 2000) / 2000;
      const val = cycle <= 0.5 ? cycle * 2 : 2 - cycle * 2;
      setForce(val);
      chargeRef.current = requestAnimationFrame(animate);
    };
    chargeRef.current = requestAnimationFrame(animate);
    return () => { if (chargeRef.current) cancelAnimationFrame(chargeRef.current); };
  }, [holdState]);

  const handlePointerDown = () => {
    if (disabled || spinning) return;
    // Start waiting phase — user must hold for HOLD_DELAY ms
    setHoldState('waiting');
    holdTimerRef.current = setTimeout(() => {
      setHoldState('charging');
      playChargeStart();
      vibrate(25);
    }, HOLD_DELAY);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = undefined; }

    if (holdState === 'waiting') {
      // Released too early — accidental tap
      setHoldState('idle');
      return;
    }
    if (holdState === 'charging') {
      setHoldState('idle');
      if (chargeRef.current) cancelAnimationFrame(chargeRef.current);
      vibrate(15);
      onForceSelected?.(force);
    }
  };

  const handlePointerLeave = () => {
    if (holdState !== 'idle') handlePointerUp();
  };

  if (prizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg>
        </div>
        <p className="text-sm">Agrega premios para ver la ruleta</p>
      </div>
    );
  }

  const forceColor = force < 0.33 ? '#22c55e' : force < 0.66 ? '#f59e0b' : '#ef4444';
  const forceLabel = force < 0.33 ? 'Suave' : force < 0.66 ? 'Media' : 'Fuerte';
  const isCharging = holdState === 'charging';
  const isWaiting = holdState === 'waiting';

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full">
      <canvas ref={canvasRef} className="max-w-full" />

      {showForceBar && !spinning && !disabled && (
        <div className="w-full max-w-xs space-y-2.5">
          {/* Force bar */}
          <div className="relative h-7 bg-muted/60 rounded-full overflow-hidden border border-border/50">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
              style={{ width: `${(isCharging ? force : 0) * 100}%`, background: `linear-gradient(90deg, #22c55e, ${forceColor})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider mix-blend-difference text-white">
                {isCharging ? forceLabel : isWaiting ? 'Seguí manteniendo...' : 'Mantené presionado'}
              </span>
            </div>
          </div>

          {/* Spin button — requires deliberate long press */}
          <button
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerLeave}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            disabled={disabled}
            className={`w-full h-12 rounded-xl font-semibold text-white text-sm transition-all select-none touch-none ${
              isCharging
                ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-lg shadow-red-500/25 scale-[1.02]'
                : isWaiting
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-indigo-500/25 scale-[0.98] opacity-90'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 active:scale-[0.97]'
            } disabled:opacity-50`}
          >
            {isCharging
              ? `Fuerza: ${Math.round(force * 100)}% — ¡Soltá para girar!`
              : isWaiting
                ? 'Seguí manteniendo...'
                : '¡Mantené presionado para girar!'}
          </button>

          <p className="text-[11px] text-center text-muted-foreground">
            Mantené el botón al menos medio segundo para cargar la fuerza
          </p>
        </div>
      )}
    </div>
  );
}
