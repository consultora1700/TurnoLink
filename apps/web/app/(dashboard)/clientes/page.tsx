'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  Phone,
  Mail,
  Calendar,
  Users,
  UserPlus,
  Star,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';
import { formatShortDate } from '@/lib/utils';

/**
 * Normalizes a phone number for WhatsApp.
 * Handles Argentine numbers without country code.
 */
function normalizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.length === 10 && !cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('15')) {
    cleaned = '549' + cleaned.substring(2);
  } else if (cleaned.length >= 12 && cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }
  return cleaned;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalBookings?: number;
  lastBookingAt?: string | null;
}

const colorVariants = [
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  { gradient: 'from-teal-500 to-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400' },
  { gradient: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
];

export default function ClientesPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadCustomers();
    }
  }, [session, search]);

  const loadCustomers = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const params: Record<string, string> = { limit: '50' };
      if (search) params.search = search;
      const data = await api.getCustomers(params);
      // data puede ser array directo o {data: [], meta: {}}
      const customersArray = Array.isArray(data) ? data : (data?.data || []);
      setCustomers(customersArray as Customer[]);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalCustomers = customers.length;
  const totalBookings = customers.reduce((acc, c) => acc + (c.totalBookings || 0), 0);
  const avgBookings = totalCustomers > 0 ? (totalBookings / totalCustomers).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-teal-600 to-red-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Clientes</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Lista de todos tus clientes
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalCustomers}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total Clientes</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalBookings}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total Turnos</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{avgBookings}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Turnos/Cliente</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {search ? 'No se encontraron clientes' : 'No tienes clientes aún'}
            </h3>
            <p className="text-muted-foreground">
              {search
                ? 'Intenta con otro término de búsqueda'
                : 'Los clientes aparecerán aquí cuando realicen reservas'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer, index) => {
            const colorVariant = colorVariants[index % colorVariants.length];
            const isFrequent = (customer.totalBookings || 0) >= 5;
            return (
              <Card
                key={customer.id}
                className="group border-0 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorVariant.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {customer.name}
                          {isFrequent && (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Cliente desde hace tiempo
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${colorVariant.bg} ${colorVariant.text} border-0`}
                    >
                      {customer.totalBookings || 0} turnos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium">{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm truncate">{customer.email}</span>
                    </div>
                  )}

                  {customer.lastBookingAt && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Último turno</p>
                        <p className="text-sm font-medium">
                          {formatShortDate(customer.lastBookingAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => window.open(`https://wa.me/${normalizePhoneForWhatsApp(customer.phone)}`, '_blank')}
                    >
                      <MessageSquare className="h-4 w-4 mr-1 text-green-600" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => window.open(`tel:${customer.phone}`, '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-1 text-blue-600" />
                      Llamar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
