'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, UserX, Phone as PhoneIcon, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ApiClient, Customer } from '@/lib/api';

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  isAnonymous?: boolean;
}

interface CustomerSearchProps {
  api: ApiClient;
  onSelect: (customer: CustomerData) => void;
  selected: CustomerData | null;
}

export function CustomerSearch({ api, onSelect, selected }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CustomerData>({ name: '', phone: '', email: '' });
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.getCustomers({ search: query, limit: 5 });
        const customers = Array.isArray(data) ? data : (data?.data || []);
        setResults(customers);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, api]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    onSelect({ name: customer.name, phone: customer.phone, email: customer.email || '' });
    setQuery('');
    setShowDropdown(false);
    setShowNewForm(false);
  };

  const handleAnonymous = () => {
    onSelect({ name: 'Cliente', phone: '0000000000', isAnonymous: true });
  };

  const handleCreateNew = () => {
    if (newCustomer.name && newCustomer.phone) {
      onSelect(newCustomer);
      setShowNewForm(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cliente seleccionado</Label>
        <div className={`flex items-center gap-3 p-3 border rounded-lg ${
          selected.isAnonymous
            ? 'bg-slate-50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700'
            : 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800'
        }`}>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            selected.isAnonymous
              ? 'bg-slate-100 dark:bg-neutral-800'
              : 'bg-teal-100 dark:bg-teal-900/40'
          }`}>
            {selected.isAnonymous
              ? <UserX className="h-5 w-5 text-slate-500 dark:text-neutral-400" />
              : <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {selected.isAnonymous ? 'Sin datos de cliente' : selected.name}
            </p>
            {!selected.isAnonymous && (
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSelect(null as unknown as CustomerData)}>
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <Label className="text-sm font-medium">Buscar cliente</Label>

      {!showNewForm ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nombre o teléfono..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Results dropdown */}
          {showDropdown && (
            <div className="border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto">
              {results.length > 0 ? (
                results.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                    {customer.totalBookings > 0 && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {customer.totalBookings} turnos
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No se encontraron clientes
                </div>
              )}
            </div>
          )}

          {/* Anonymous client button */}
          <button
            onClick={handleAnonymous}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <UserX className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Atender sin datos</p>
              <p className="text-xs text-muted-foreground">No registrar datos del cliente</p>
            </div>
          </button>

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nuevo cliente
          </Button>
        </>
      ) : (
        <div className="space-y-3 p-4 border rounded-lg bg-slate-50 dark:bg-neutral-800/50">
          <p className="font-medium text-sm">Nuevo cliente</p>

          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre *"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Teléfono *"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                className="pl-10"
                type="tel"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Email (opcional)"
                value={newCustomer.email || ''}
                onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                className="pl-10"
                type="email"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setShowNewForm(false);
                setNewCustomer({ name: '', phone: '', email: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              disabled={!newCustomer.name || !newCustomer.phone}
              onClick={handleCreateNew}
            >
              Usar este cliente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
