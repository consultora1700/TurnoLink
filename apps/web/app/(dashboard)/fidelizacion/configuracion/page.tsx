'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function ConfiguracionFidelizacionPage() {
  const { data: session } = useSession();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    isActive: false,
    programName: 'Programa de Puntos',
    pointsPerBooking: 10,
    pointsPerCurrencyUnit: '',
    currencyPerPoint: 1,
  });

  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);
    api.get('/loyalty/program')
      .then((p: any) => {
        if (p) {
          setProgram(p);
          setForm({
            isActive: p.isActive,
            programName: p.programName,
            pointsPerBooking: p.pointsPerBooking,
            pointsPerCurrencyUnit: p.pointsPerCurrencyUnit || '',
            currencyPerPoint: Number(p.currencyPerPoint) || 1,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data: any = {
        isActive: form.isActive,
        programName: form.programName,
        pointsPerBooking: Number(form.pointsPerBooking),
        currencyPerPoint: Number(form.currencyPerPoint),
        pointsPerCurrencyUnit: form.pointsPerCurrencyUnit ? Number(form.pointsPerCurrencyUnit) : null,
      };
      if (program) {
        await api.patch('/loyalty/program', data);
      } else {
        await api.post('/loyalty/program', data);
      }
      setProgram({ ...program, ...data });
      toast({ title: 'Configuracion guardada' });
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6"><div className="h-64 animate-pulse bg-muted rounded-lg" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Configuracion del programa</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Programa de puntos
          </CardTitle>
          <CardDescription>Configura como tus clientes acumulan y usan puntos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Programa activo</Label>
            <button
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="programName">Nombre del programa</Label>
            <Input
              id="programName"
              value={form.programName}
              onChange={(e) => setForm(f => ({ ...f, programName: e.target.value }))}
              placeholder="Programa de Puntos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pointsPerBooking">Puntos por turno completado</Label>
            <Input
              id="pointsPerBooking"
              type="number"
              min={1}
              value={form.pointsPerBooking}
              onChange={(e) => setForm(f => ({ ...f, pointsPerBooking: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pointsPerCurrencyUnit">Puntos por $1 gastado (opcional)</Label>
            <Input
              id="pointsPerCurrencyUnit"
              type="number"
              min={0}
              step={0.01}
              value={form.pointsPerCurrencyUnit}
              onChange={(e) => setForm(f => ({ ...f, pointsPerCurrencyUnit: e.target.value }))}
              placeholder="Vacio = usar puntos fijos por turno"
            />
            <p className="text-xs text-muted-foreground">Si se completa, se usan puntos por monto en vez de puntos fijos</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyPerPoint">Valor de 1 punto en ARS</Label>
            <Input
              id="currencyPerPoint"
              type="number"
              min={0.0001}
              step={0.01}
              value={form.currencyPerPoint}
              onChange={(e) => setForm(f => ({ ...f, currencyPerPoint: Number(e.target.value) }))}
            />
            <p className="text-xs text-muted-foreground">Determina el valor monetario de los puntos en circulacion</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
