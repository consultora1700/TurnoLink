'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Label } from './label';
import { getContrastTextColor } from '@/lib/color-contrast';

// Predefined color palettes
const COLOR_PRESETS = {
  primary: [
    { name: 'Teal TurnoLink', value: '#3F8697' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Verde', value: '#059669' },
    { name: 'Violeta', value: '#7C3AED' },
    { name: 'Naranja', value: '#EA580C' },
    { name: 'Cyan', value: '#0891B2' },
    { name: 'Rosa Suave', value: '#EC4899' },
    { name: 'Índigo', value: '#4F46E5' },
    { name: 'Rojo', value: '#DC2626' },
    { name: 'Teal', value: '#0D9488' },
  ],
  secondary: [
    { name: 'Violeta', value: '#8B5CF6' },
    { name: 'Azul Cielo', value: '#38BDF8' },
    { name: 'Verde Menta', value: '#34D399' },
    { name: 'Rosa', value: '#F472B6' },
    { name: 'Ámbar', value: '#FBBF24' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Slate', value: '#64748B' },
    { name: 'Coral', value: '#FB7185' },
    { name: 'Lima', value: '#A3E635' },
    { name: 'Índigo', value: '#818CF8' },
  ],
  accent: [
    { name: 'Ámbar', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Verde', value: '#22C55E' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Fucsia', value: '#D946EF' },
    { name: 'Naranja', value: '#F97316' },
    { name: 'Lima', value: '#84CC16' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Violeta', value: '#8B5CF6' },
  ],
};

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  presetType?: 'primary' | 'secondary' | 'accent';
  defaultValue?: string;
}

export function ColorPicker({
  value,
  onChange,
  label,
  description,
  presetType = 'primary',
  defaultValue,
}: ColorPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const presets = COLOR_PRESETS[presetType];

  const selectedPreset = presets.find(p => p.value.toUpperCase() === value.toUpperCase());

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {defaultValue && value.toUpperCase() !== defaultValue.toUpperCase() && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        )}
      </div>

      {/* Current Color Display - Tap to expand */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full rounded-xl border-2 transition-all duration-200',
          'active:scale-[0.98]',
          'flex items-center gap-3 p-3',
          isExpanded ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        )}
      >
        {/* Large color swatch */}
        <div
          className="h-12 w-12 rounded-xl shadow-sm ring-1 ring-black/10 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-sm truncate">
            {selectedPreset?.name || 'Personalizado'}
          </p>
          <p className="font-mono text-xs text-muted-foreground uppercase">
            {value}
          </p>
        </div>
        {/* Expand indicator */}
        <ChevronDown className={cn(
          'h-5 w-5 text-muted-foreground transition-transform',
          isExpanded && 'rotate-180'
        )} />
      </button>

      {/* Expanded Color Grid */}
      {isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Preset Colors Grid - Large touch targets */}
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => {
              const isSelected = value.toUpperCase() === preset.value.toUpperCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange(preset.value);
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'relative aspect-square rounded-xl transition-all duration-150',
                    'active:scale-90',
                    'ring-1 ring-black/10',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected && 'ring-2 ring-primary ring-offset-2'
                  )}
                  style={{ backgroundColor: preset.value }}
                  aria-label={preset.name}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center">
                        <Check className="h-4 w-4 text-black" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom color picker */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="relative">
              <input
                ref={colorInputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="h-10 w-10 rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: !selectedPreset ? value : 'transparent' }}
                onClick={() => colorInputRef.current?.click()}
              >
                {selectedPreset && (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Elegir otro color
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// Full color picker section with all 3 colors and live preview
interface ColorPickerSectionProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onReset?: () => void;
}

export function ColorPickerSection({
  primaryColor,
  secondaryColor,
  accentColor,
  onPrimaryChange,
  onSecondaryChange,
  onAccentChange,
  onReset,
}: ColorPickerSectionProps) {
  return (
    <div className="space-y-6">
      {/* Live Preview First - Mobile users see result immediately */}
      <div className="p-4 sm:p-6 rounded-2xl border bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Vista previa</p>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restablecer
            </Button>
          )}
        </div>

        {/* Compact Preview */}
        <div className="space-y-3">
          {/* Header bar */}
          {(() => {
            const isDark = getContrastTextColor(primaryColor) === 'light';
            const dot = isDark ? 'bg-white/25' : 'bg-black/15';
            const bar = isDark ? 'bg-white/35' : 'bg-black/20';
            return (
              <div
                className="h-10 sm:h-12 rounded-xl flex items-center px-3 sm:px-4 gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full ${dot}`} />
                <div className={`h-2 w-16 sm:w-24 rounded ${bar}`} />
                <div className="flex-1" />
                <div className={`h-2 w-12 rounded ${dot}`} />
              </div>
            );
          })()}

          {/* Content row */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 p-3 rounded-xl border bg-white dark:bg-neutral-800">
              <div
                className="h-8 sm:h-10 rounded-lg mb-2"
                style={{ backgroundColor: secondaryColor + '20' }}
              />
              <div className="flex gap-2">
                <button
                  className="px-2 sm:px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: primaryColor, color: getContrastTextColor(primaryColor) === 'light' ? '#ffffff' : '#1e293b' }}
                >
                  Reservar
                </button>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#22C55E20', color: '#22C55E' }}
                >
                  Nuevo
                </span>
              </div>
            </div>
            <div
              className="w-16 sm:w-20 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: secondaryColor + '15' }}
            >
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>

          {/* Color dots */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div
              className="h-6 w-6 rounded-full ring-2 ring-offset-2"
              style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
            <div
              className="h-6 w-6 rounded-full ring-2 ring-offset-2"
              style={{ backgroundColor: secondaryColor, '--tw-ring-color': secondaryColor } as React.CSSProperties}
            />
            <div
              className="h-6 w-6 rounded-full ring-2 ring-offset-2"
              style={{ backgroundColor: accentColor, '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Color Pickers - Stacked on mobile */}
      <div className="space-y-4">
        <ColorPicker
          value={primaryColor}
          onChange={onPrimaryChange}
          label="Color principal"
          description="Botones y acciones principales"
          presetType="primary"
          defaultValue="#3F8697"
        />
        <ColorPicker
          value={secondaryColor}
          onChange={onSecondaryChange}
          label="Color secundario"
          description="Fondos y elementos secundarios"
          presetType="secondary"
          defaultValue="#8B5CF6"
        />
        <ColorPicker
          value={accentColor}
          onChange={onAccentChange}
          label="Color de acento"
          description="Alertas y destacados"
          presetType="accent"
          defaultValue="#F59E0B"
        />
      </div>
    </div>
  );
}
