'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReportParams } from '@/lib/api';

const periods = [
  { label: '7d', value: '7d' as const },
  { label: '30d', value: '30d' as const },
  { label: '90d', value: '90d' as const },
];

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: ReportParams;
  onChange: (params: ReportParams) => void;
}) {
  const [customStart, setCustomStart] = useState(value.startDate || '');
  const [customEnd, setCustomEnd] = useState(value.endDate || '');
  const isCustom = value.period === 'custom';

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onChange({ period: 'custom', startDate: customStart, endDate: customEnd });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period pills */}
      <div className="inline-flex items-center rounded-lg bg-muted/60 dark:bg-muted/40 p-0.5 border border-border/50">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange({ period: p.value })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              value.period === p.value
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => onChange({ period: 'custom', startDate: customStart, endDate: customEnd })}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
            isCustom
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="h-3 w-3" />
          Rango
        </button>
      </div>

      {/* Custom date inputs */}
      {isCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="h-8 w-auto text-xs"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">a</span>
          <Input
            type="date"
            className="h-8 w-auto text-xs"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
          <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={handleApplyCustom}>
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
