'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, Globe, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

export const PLATFORM_TENANT = {
  id: 'platform',
  name: 'TurnoLink (Plataforma)',
  slug: 'turnolink',
};

interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

interface TenantSelectorProps {
  value: string;
  onChange: (tenantId: string, tenantName: string) => void;
  label?: string;
}

export function TenantSelector({ value, onChange, label = 'Negocio / Marca' }: TenantSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      let adminKey = '';
      try {
        const stored = localStorage.getItem('admin_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session.key && session.expiresAt > Date.now()) adminKey = session.key;
        }
      } catch {}
      const res = await fetch(`${API_URL}/api/admin/tenants?limit=200`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        const list = (data.data || data).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
        }));
        setTenants(list);
      }
    } catch (e) {
      console.error('Failed to load tenants:', e);
    } finally {
      setLoading(false);
    }
  };

  const allOptions = useMemo(() => [PLATFORM_TENANT, ...tenants], [tenants]);

  const filtered = useMemo(() => {
    if (!search) return allOptions;
    const q = search.toLowerCase();
    return allOptions.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [allOptions, search]);

  const selected = allOptions.find((t) => t.id === value);

  const handleSelect = (tenant: TenantOption) => {
    onChange(tenant.id, tenant.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start font-normal"
          >
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.id === 'platform' ? (
                  <Globe className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                {selected.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Seleccionar negocio...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar negocio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin resultados</p>
            ) : (
              filtered.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSelect(tenant)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
                >
                  {tenant.id === 'platform' ? (
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tenant.name}</div>
                    {tenant.id !== 'platform' && (
                      <div className="text-xs text-muted-foreground truncate">{tenant.slug}</div>
                    )}
                  </div>
                  {value === tenant.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
