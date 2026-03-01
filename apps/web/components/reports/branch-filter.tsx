'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Branch } from '@/lib/api';

export function BranchFilter({
  branches,
  value,
  onChange,
}: {
  branches: Branch[];
  value: string | undefined;
  onChange: (branchId: string | undefined) => void;
}) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(v) => onChange(v === 'all' ? undefined : v)}
    >
      <SelectTrigger className="w-[200px] h-8 text-sm">
        <SelectValue placeholder="Todas las sucursales" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las sucursales</SelectItem>
        {branches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
