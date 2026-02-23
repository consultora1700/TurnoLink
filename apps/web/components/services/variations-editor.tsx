'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface VariationOption {
  id: string;
  name: string;
  priceModifier: number;
  pricingType: 'absolute' | 'relative';
  durationModifier: number;
}

export interface VariationGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  required: boolean;
  options: VariationOption[];
}

interface VariationsEditorProps {
  value: VariationGroup[];
  onChange: (groups: VariationGroup[]) => void;
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

export function VariationsEditor({ value, onChange }: VariationsEditorProps) {
  const [expanded, setExpanded] = useState(value.length > 0);

  const addGroup = () => {
    onChange([
      ...value,
      {
        id: generateId(),
        label: '',
        type: 'single',
        required: false,
        options: [
          { id: generateId(), name: '', priceModifier: 0, pricingType: 'absolute', durationModifier: 0 },
        ],
      },
    ]);
  };

  const removeGroup = (groupId: string) => {
    onChange(value.filter(g => g.id !== groupId));
  };

  const updateGroup = (groupId: string, updates: Partial<VariationGroup>) => {
    onChange(value.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const addOption = (groupId: string) => {
    onChange(value.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        options: [...g.options, { id: generateId(), name: '', priceModifier: 0, pricingType: 'absolute' as const, durationModifier: 0 }],
      };
    }));
  };

  const removeOption = (groupId: string, optionId: string) => {
    onChange(value.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, options: g.options.filter(o => o.id !== optionId) };
    }));
  };

  const updateOption = (groupId: string, optionId: string, updates: Partial<VariationOption>) => {
    onChange(value.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        options: g.options.map(o => o.id === optionId ? { ...o, ...updates } : o),
      };
    }));
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          if (!expanded && value.length === 0) {
            addGroup();
          }
          setExpanded(!expanded);
        }}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Variaciones de precio/duración
        {value.length > 0 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
            {value.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-3 pl-1">
          {value.map((group) => (
            <div key={group.id} className="border rounded-lg p-3 space-y-3 bg-muted/20">
              {/* Group header */}
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={group.label}
                    onChange={(e) => updateGroup(group.id, { label: e.target.value })}
                    placeholder="Nombre del grupo (ej: Duración, Extras)"
                    className="h-9 text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`type-${group.id}`}
                        checked={group.type === 'single'}
                        onChange={() => updateGroup(group.id, { type: 'single' })}
                        className="accent-blue-500"
                      />
                      <span>Una opción</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`type-${group.id}`}
                        checked={group.type === 'multi'}
                        onChange={() => updateGroup(group.id, { type: 'multi' })}
                        className="accent-blue-500"
                      />
                      <span>Múltiples</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={group.required}
                        onChange={(e) => updateGroup(group.id, { required: e.target.checked })}
                        className="accent-blue-500"
                      />
                      <span>Obligatorio</span>
                    </label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGroup(group.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Opciones</Label>
                {group.options.map((option) => (
                  <div key={option.id} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={option.name}
                      onChange={(e) => updateOption(group.id, option.id, { name: e.target.value })}
                      placeholder="Nombre (ej: 3 horas)"
                      className="h-8 text-sm flex-1"
                    />
                    <div className="flex gap-1.5">
                      <div className="relative flex-1 sm:w-24 sm:flex-none">
                        <Input
                          type="number"
                          value={option.priceModifier || ''}
                          onChange={(e) => updateOption(group.id, option.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                          placeholder="Precio"
                          className="h-8 text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => updateOption(group.id, option.id, {
                            pricingType: option.pricingType === 'absolute' ? 'relative' : 'absolute',
                          })}
                          className={`absolute right-1 top-1 h-6 px-1.5 rounded text-[10px] font-medium transition-colors ${
                            option.pricingType === 'relative'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          title={option.pricingType === 'absolute' ? 'Precio fijo' : 'Suma al precio base'}
                        >
                          {option.pricingType === 'absolute' ? '$' : '+$'}
                        </button>
                      </div>
                      <div className="relative w-20 sm:w-20">
                        <Input
                          type="number"
                          value={option.durationModifier || ''}
                          onChange={(e) => updateOption(group.id, option.id, { durationModifier: parseInt(e.target.value) || 0 })}
                          placeholder="±min"
                          className="h-8 text-sm pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">min</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(group.id, option.id)}
                        disabled={group.options.length <= 1}
                        className="h-8 w-8 text-red-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(group.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Agregar opción
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar grupo de variaciones
          </button>
        </div>
      )}
    </div>
  );
}
