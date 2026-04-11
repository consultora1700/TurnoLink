'use client';

import { Lock, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradeWallProps {
  title: string;
  description: string;
  planName?: string;
  /** Optional labels for blurred preview cards behind the lock overlay */
  previewLabels?: string[];
}

export function UpgradeWall({ title, description, planName = 'Profesional', previewLabels }: UpgradeWallProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Blurred preview background */}
        <div className="blur-[2px] pointer-events-none select-none opacity-50">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(previewLabels || ['Datos', 'Estadísticas', 'Detalle', 'Resumen']).map((label) => (
              <Card key={label} className="border-0 shadow-md bg-gradient-to-br from-slate-400 to-slate-500 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$---</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="border shadow-lg p-6 text-center max-w-sm bg-white dark:bg-neutral-800">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium mb-4">
              <Crown className="h-3.5 w-3.5" />
              Disponible desde el plan {planName}
            </div>
            <Button asChild className="w-full">
              <a href="/mi-suscripcion">Mejorar mi plan</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
