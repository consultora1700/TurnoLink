'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface Prize {
  name: string;
  color: string;
  weight: number;
}

interface PrizeEditorProps {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
}

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function PrizeEditor({ prizes, onChange }: PrizeEditorProps) {
  const addPrize = () => {
    onChange([...prizes, { name: '', color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], weight: 1 }]);
  };

  const removePrize = (index: number) => {
    onChange(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: keyof Prize, value: string | number) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Premios</Label>
        <button type="button" onClick={addPrize} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>
      {prizes.map((prize, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="color" value={prize.color} onChange={e => updatePrize(i, 'color', e.target.value)} className="h-9 w-9 rounded border cursor-pointer flex-shrink-0" />
          <Input value={prize.name} onChange={e => updatePrize(i, 'name', e.target.value)} placeholder="Nombre del premio" className="flex-1" />
          <Input type="number" min={1} value={prize.weight} onChange={e => updatePrize(i, 'weight', Number(e.target.value))} className="w-16" title="Peso" />
          <button type="button" onClick={() => removePrize(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      {prizes.length === 0 && <p className="text-sm text-muted-foreground">Sin premios. Agrega al menos uno.</p>}
    </div>
  );
}
