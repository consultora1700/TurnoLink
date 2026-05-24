'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface PhotoEditorProps {
  open: boolean;
  imageUrl: string;
  initialScale: number;
  initialOffsetX: number;
  initialOffsetY: number;
  fallbackBgColor?: string;
  shape?: 'round' | 'square';
  onApply: (scale: number, offsetX: number, offsetY: number) => void;
  onCancel: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.05;

export function PhotoEditor({
  open,
  imageUrl,
  initialScale,
  initialOffsetX,
  initialOffsetY,
  fallbackBgColor = '#1f2937',
  shape = 'round',
  onApply,
  onCancel,
}: PhotoEditorProps) {
  const [scale, setScale] = useState(initialScale);
  const [offsetX, setOffsetX] = useState(initialOffsetX);
  const [offsetY, setOffsetY] = useState(initialOffsetY);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setScale(initialScale);
      setOffsetX(initialOffsetX);
      setOffsetY(initialOffsetY);
    }
  }, [open, initialScale, initialOffsetX, initialOffsetY]);

  const clampScale = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  const clampOffset = (v: number) => Math.min(50, Math.max(-50, v));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => clampScale(s + (e.deltaY < 0 ? SCALE_STEP * 2 : -SCALE_STEP * 2)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [offsetX, offsetY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    setOffsetX(clampOffset(dragStart.current.ox + dx));
    setOffsetY(clampOffset(dragStart.current.oy + dy));
  }, [dragging]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (dist - lastTouchDist.current) * 0.01;
      lastTouchDist.current = dist;
      setScale((s) => clampScale(s + delta));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const transform = `scale(${scale}) translate(${offsetX}%, ${offsetY}%)`;
  const previewStyle = { transform, transformOrigin: 'center' };
  const borderRadius = shape === 'round' ? '9999px' : '12px';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold">Ajustar foto</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
            <Move className="h-3.5 w-3.5" />
            <span>Arrastrá para mover · Scroll o pinch para zoom</span>
          </div>
          <div
            ref={canvasRef}
            className="relative mx-auto overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-grab active:cursor-grabbing select-none"
            style={{
              width: 240,
              height: 240,
              borderRadius,
              backgroundColor: fallbackBgColor,
              touchAction: 'none',
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={imageUrl}
              alt="Logo"
              className="w-full h-full object-cover pointer-events-none"
              style={previewStyle}
              draggable={false}
            />
          </div>
        </div>

        {/* Slider */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={SCALE_STEP}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-amber-500 bg-slate-200 dark:bg-slate-700"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        {/* Mini previews */}
        <div className="px-5 pb-3">
          <p className="text-xs text-muted-foreground mb-2">Así se verá:</p>
          <div className="flex items-end justify-center gap-5">
            {[
              { size: 64, label: 'Panel' },
              { size: 44, label: 'Menú' },
              { size: 28, label: 'Mapa' },
            ].map(({ size, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className="overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm flex-shrink-0"
                  style={{
                    width: size,
                    height: size,
                    borderRadius: shape === 'round' ? '50%' : '6px',
                    backgroundColor: fallbackBgColor,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={label}
                    className="w-full h-full object-cover"
                    style={previewStyle}
                    draggable={false}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onApply(scale, offsetX, offsetY)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
              style={{ backgroundColor: fallbackBgColor }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
