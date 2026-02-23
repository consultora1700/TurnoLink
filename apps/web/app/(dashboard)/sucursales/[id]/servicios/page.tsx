'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Scissors,
  Loader2,
  Check,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { createApiClient, Branch, Service, BranchService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDuration } from '@/lib/utils';

export default function BranchServiciosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [branchServices, setBranchServices] = useState<BranchService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.accessToken && branchId) {
      loadData();
    }
  }, [session, branchId]);

  const loadData = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const [branchData, servicesData, branchServicesData] = await Promise.all([
        api.getBranch(branchId),
        api.getServices(),
        api.getBranchServices(branchId),
      ]);

      setBranch(branchData);
      setAllServices(Array.isArray(servicesData) ? servicesData : []);
      setBranchServices(Array.isArray(branchServicesData) ? branchServicesData : []);

      // Initialize selected services
      const selected = new Set<string>();
      (Array.isArray(branchServicesData) ? branchServicesData : []).forEach((bs: BranchService) => {
        selected.add(bs.serviceId);
      });
      setSelectedServices(selected);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar los datos', variant: 'destructive' });
      router.push('/sucursales');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.bulkAssignServicesToBranch(branchId, Array.from(selectedServices));
      toast({ title: 'Servicios actualizados', description: 'Los cambios se guardaron correctamente' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar los cambios', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    const currentIds = new Set(branchServices.map(bs => bs.serviceId));
    if (currentIds.size !== selectedServices.size) return true;
    const selectedArray = Array.from(selectedServices);
    for (let i = 0; i < selectedArray.length; i++) {
      if (!currentIds.has(selectedArray[i])) return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/sucursales" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Sucursales
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Servicios de {branch?.name}</h1>
              <p className="text-white/80">
                Selecciona los servicios disponibles en esta sucursal
              </p>
            </div>
          </div>
        </div>
      </div>

      {allServices.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No hay servicios creados</h3>
            <p className="text-muted-foreground mb-6">
              Primero debes crear servicios en la seccion de Servicios
            </p>
            <Link href="/servicios">
              <Button>
                Ir a Servicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Servicios disponibles</span>
                <Badge variant="outline">
                  {selectedServices.size} de {allServices.length} seleccionados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allServices.map((service) => {
                  const isSelected = selectedServices.has(service.id);
                  return (
                    <div
                      key={service.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleService(service.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{service.name}</p>
                          {!service.isActive && (
                            <Badge variant="outline" className="text-xs">Inactivo</Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${service.price}</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(service.duration)}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link href="/sucursales">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving || !hasChanges()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
