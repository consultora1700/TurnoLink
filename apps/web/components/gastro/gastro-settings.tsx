'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  Loader2,
  Save,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Check,
  Percent,
  Users,
  LayoutGrid,
  Shuffle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';

interface GastroConfig {
  tableCount?: number;
  enableDineIn?: boolean;
  enableDelivery?: boolean;
  enableTakeaway?: boolean;
  tipOptions?: number[];
  waiterAssignment?: 'dynamic' | 'pre-assigned';
  tableAssignments?: Record<string, string>; // { "1": "employeeId", "2": "employeeId" }
}

export function GastroSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<GastroConfig>({
    enableDineIn: true,
    enableDelivery: true,
    enableTakeaway: true,
    tipOptions: [10, 15, 20],
    waiterAssignment: 'dynamic',
    tableAssignments: {},
  });
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const getApi = useCallback(() => {
    if (!session?.accessToken) return null;
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  useEffect(() => {
    const api = getApi();
    if (!api) return;

    Promise.all([
      api.getTenant(),
      api.getGastroTables(),
    ]).then(([t, gastroData]: [any, any]) => {
      const settings = typeof t.settings === 'string' ? JSON.parse(t.settings) : (t.settings || {});
      if (settings.gastroConfig) {
        setConfig({
          enableDineIn: settings.gastroConfig.enableDineIn ?? true,
          enableDelivery: settings.gastroConfig.enableDelivery ?? true,
          enableTakeaway: settings.gastroConfig.enableTakeaway ?? true,
          tipOptions: settings.gastroConfig.tipOptions || [10, 15, 20],
          tableCount: settings.gastroConfig.tableCount || 0,
          waiterAssignment: settings.gastroConfig.waiterAssignment || 'dynamic',
          tableAssignments: settings.gastroConfig.tableAssignments || {},
        });
      }
      if (gastroData?.employees) setEmployees(gastroData.employees);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [getApi]);

  const handleSave = useCallback(async () => {
    const api = getApi();
    if (!api) return;

    setSaving(true);
    setSaved(false);
    try {
      const tenant = await api.getTenant();
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : (tenant.settings || {});

      settings.gastroConfig = {
        ...settings.gastroConfig,
        enableDineIn: config.enableDineIn,
        enableDelivery: config.enableDelivery,
        enableTakeaway: config.enableTakeaway,
        tipOptions: config.tipOptions,
        waiterAssignment: config.waiterAssignment,
        tableAssignments: config.waiterAssignment === 'pre-assigned' ? config.tableAssignments : {},
      };

      await api.updateTenant({ settings: JSON.stringify(settings) } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  }, [getApi, config]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando ajustes...</p>
      </div>
    );
  }

  const toggles = [
    {
      key: 'enableDineIn' as const,
      label: 'Comer en el local',
      icon: UtensilsCrossed,
      desc: 'Pedidos desde mesa escaneando QR',
      color: 'amber',
    },
    {
      key: 'enableDelivery' as const,
      label: 'Delivery',
      icon: Truck,
      desc: 'Envío a domicilio para clientes web',
      color: 'blue',
    },
    {
      key: 'enableTakeaway' as const,
      label: 'Para llevar',
      icon: ShoppingBag,
      desc: 'Retiro en el local',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Order modes */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-600" />
              Modos de pedido
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elegí qué opciones ven tus clientes al entrar a tu página.
            </p>
          </div>

          <div className="space-y-2.5">
            {toggles.map(({ key, label, icon: Icon, desc }) => {
              const active = !!config[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    active
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                      : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    active
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-slate-100 dark:bg-neutral-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{desc}</p>
                  </div>

                  {/* Toggle switch */}
                  <div className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
                    active ? 'bg-amber-500' : 'bg-slate-300 dark:bg-neutral-600'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      active ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tip options */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-600" />
              Opciones de propina
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Porcentajes sugeridos que verá el cliente al pagar. Siempre puede elegir &quot;Sin propina&quot;.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {(config.tipOptions || []).map((pct, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-700/50 rounded-xl px-3 py-2">
                <input
                  type="number"
                  value={pct}
                  onChange={(e) => {
                    const newTips = [...(config.tipOptions || [])];
                    newTips[i] = parseInt(e.target.value) || 0;
                    setConfig((prev) => ({ ...prev, tipOptions: newTips }));
                  }}
                  className="w-12 px-1 py-1 text-center text-sm font-bold rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0}
                  max={100}
                />
                <span className="text-sm font-medium text-slate-400">%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waiter assignment mode */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Asignación de mozos
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elegí cómo se asignan los mozos a las mesas de tu salón.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dynamic mode */}
            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, waiterAssignment: 'dynamic' }))}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                config.waiterAssignment !== 'pre-assigned'
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  config.waiterAssignment !== 'pre-assigned'
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-slate-100 dark:bg-neutral-700'
                }`}>
                  <Shuffle className={`w-4 h-4 ${
                    config.waiterAssignment !== 'pre-assigned'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400 dark:text-neutral-500'
                  }`} />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Dinámico</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                Cualquier mozo atiende cualquier mesa. El encargado asigna el mozo desde el salón cuando va a atender.
              </p>
            </button>

            {/* Pre-assigned mode */}
            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, waiterAssignment: 'pre-assigned' }))}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                config.waiterAssignment === 'pre-assigned'
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  config.waiterAssignment === 'pre-assigned'
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-slate-100 dark:bg-neutral-700'
                }`}>
                  <LayoutGrid className={`w-4 h-4 ${
                    config.waiterAssignment === 'pre-assigned'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400 dark:text-neutral-500'
                  }`} />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Por sectores</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                Cada mozo tiene mesas fijas asignadas. Al abrir una mesa, el mozo se asigna automáticamente.
              </p>
            </button>
          </div>

          {/* Table-to-waiter mapping (only for pre-assigned) */}
          {config.waiterAssignment === 'pre-assigned' && (
            <div className="space-y-3 pt-2">
              {employees.length === 0 ? (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    No tenés mozos cargados
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-1">
                    Andá a la sección <strong>Mozos / Staff</strong> para agregar empleados primero.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                    Asigná un mozo a cada mesa. Las mesas sin asignar podrán ser atendidas por cualquiera.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array.from({ length: config.tableCount || 0 }, (_, i) => i + 1).map((tableNum) => (
                      <div key={tableNum} className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-700/50 rounded-lg p-2.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-neutral-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                          {tableNum}
                        </span>
                        <select
                          value={config.tableAssignments?.[String(tableNum)] || ''}
                          onChange={(e) => {
                            setConfig((prev) => ({
                              ...prev,
                              tableAssignments: {
                                ...prev.tableAssignments,
                                [String(tableNum)]: e.target.value,
                              },
                            }));
                          }}
                          className="flex-1 min-w-0 text-xs bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-600 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 truncate"
                        >
                          <option value="">—</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  {(config.tableCount || 0) === 0 && (
                    <p className="text-xs text-slate-400 dark:text-neutral-500 italic">
                      Configurá la cantidad de mesas en la pestaña Códigos QR primero.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full sm:w-auto h-11 shadow-sm transition-all ${
          saved
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : saved ? (
          <Check className="w-4 h-4 mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {saved ? 'Guardado' : 'Guardar configuración'}
      </Button>
    </div>
  );
}
