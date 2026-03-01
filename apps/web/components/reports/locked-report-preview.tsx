'use client';

import { Lock, TrendingUp, Clock, Users, BarChart3, Download, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const FEATURES = [
  { icon: TrendingUp, text: 'Ingresos en el tiempo', desc: 'Visualiza la evolución de tus ganancias' },
  { icon: Clock, text: 'Horarios pico', desc: 'Descubre cuándo tienes más demanda' },
  { icon: Users, text: 'Retención de clientes', desc: 'Mide qué tan fieles son tus clientes' },
  { icon: BarChart3, text: 'Rendimiento del equipo', desc: 'Evalúa a cada miembro de tu equipo' },
  { icon: Download, text: 'Exportar a CSV', desc: 'Descarga datos para tu contador' },
];

// Fake chart data for the blurred preview
function FakeAreaChart() {
  const points = [20, 35, 28, 45, 38, 55, 48, 62, 55, 70, 58, 75];
  const max = Math.max(...points);
  const width = 100;
  const height = 60;
  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (p / max) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  const fillPath = `${pathData} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      <defs>
        <linearGradient id="fakeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#fakeGradient)" />
      <path d={pathData} fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
    </svg>
  );
}

function FakeBarChart() {
  const bars = [65, 45, 80, 55, 70, 40, 90];
  const max = Math.max(...bars);
  return (
    <div className="flex items-end gap-1.5 h-20 px-2">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-gradient-to-t from-violet-400 to-violet-300 opacity-60"
          style={{ height: `${(b / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function FakeHeatmap() {
  const rows = 5;
  const cols = 10;
  return (
    <div className="grid gap-0.5 px-2 py-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const intensity = Math.random();
        const cls = intensity > 0.7 ? 'bg-violet-500/60' : intensity > 0.4 ? 'bg-violet-300/40' : 'bg-violet-100/30 dark:bg-violet-900/20';
        return <div key={i} className={`h-3 rounded-sm ${cls}`} />;
      })}
    </div>
  );
}

export function LockedReportPreview() {
  return (
    <div className="relative mt-10">
      {/* Section divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">Reportes Avanzados</span>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </span>
        </div>
      </div>

      {/* Fake charts preview (blurred) */}
      <div className="grid gap-4 md:grid-cols-3 opacity-30 pointer-events-none select-none blur-[2px]" aria-hidden>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="h-3 w-28 bg-muted rounded mb-2" />
            <div className="h-2 w-40 bg-muted/50 rounded mb-3" />
            <FakeAreaChart />
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="h-3 w-24 bg-muted rounded mb-2" />
            <div className="h-2 w-36 bg-muted/50 rounded mb-3" />
            <FakeBarChart />
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden hidden md:block">
          <CardContent className="p-4">
            <div className="h-3 w-20 bg-muted rounded mb-2" />
            <div className="h-2 w-32 bg-muted/50 rounded mb-3" />
            <FakeHeatmap />
          </CardContent>
        </Card>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ top: '40px' }}>
        <div className="backdrop-blur-sm bg-white/70 dark:bg-neutral-950/70 rounded-2xl border border-border/50 shadow-xl max-w-lg w-full mx-4 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg shadow-violet-500/20">
              <Lock className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-xl font-bold mb-1.5">Desbloquea Reportes Avanzados</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Toma decisiones informadas con insights detallados de tu negocio
            </p>

            <div className="grid grid-cols-1 gap-3 mb-6 text-left">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="h-7 w-7 rounded-md bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.text}</p>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/mi-suscripcion" className="block">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 w-full h-11 text-sm font-semibold">
                Actualizar a Profesional
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground mt-3">
              Prueba gratis 14 días — sin tarjeta de crédito
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
