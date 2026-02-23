'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Loader2,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { createApiClient, Branch, Employee, BranchEmployee } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function BranchEmpleadosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [branchEmployees, setBranchEmployees] = useState<BranchEmployee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
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
      const [branchData, employeesData, branchEmployeesData] = await Promise.all([
        api.getBranch(branchId),
        api.getEmployees(),
        api.getBranchEmployees(branchId),
      ]);

      setBranch(branchData);
      setAllEmployees(Array.isArray(employeesData) ? employeesData : []);
      setBranchEmployees(Array.isArray(branchEmployeesData) ? branchEmployeesData : []);

      // Initialize selected employees
      const selected = new Set<string>();
      (Array.isArray(branchEmployeesData) ? branchEmployeesData : []).forEach((be: BranchEmployee) => {
        selected.add(be.employeeId);
      });
      setSelectedEmployees(selected);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar los datos', variant: 'destructive' });
      router.push('/sucursales');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.bulkAssignEmployeesToBranch(branchId, Array.from(selectedEmployees));
      toast({ title: 'Empleados actualizados', description: 'Los cambios se guardaron correctamente' });
      loadData();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar los cambios', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    const currentIds = new Set(branchEmployees.map(be => be.employeeId));
    if (currentIds.size !== selectedEmployees.size) return true;
    const selectedArray = Array.from(selectedEmployees);
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
        <p className="text-muted-foreground">Cargando empleados...</p>
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
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Empleados de {branch?.name}</h1>
              <p className="text-white/80">
                Selecciona los empleados que trabajan en esta sucursal
              </p>
            </div>
          </div>
        </div>
      </div>

      {allEmployees.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No hay empleados creados</h3>
            <p className="text-muted-foreground mb-6">
              Primero debes crear empleados en la seccion de Empleados
            </p>
            <Link href="/empleados">
              <Button>
                Ir a Empleados
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Empleados disponibles</span>
                <Badge variant="outline">
                  {selectedEmployees.size} de {allEmployees.length} seleccionados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allEmployees.map((employee) => {
                  const isSelected = selectedEmployees.has(employee.id);
                  return (
                    <div
                      key={employee.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                      onClick={() => toggleEmployee(employee.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {employee.image ? (
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{employee.name}</p>
                            {!employee.isActive && (
                              <Badge variant="outline" className="text-xs">Inactivo</Badge>
                            )}
                          </div>
                          {employee.specialty && (
                            <p className="text-sm text-muted-foreground truncate">{employee.specialty}</p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
