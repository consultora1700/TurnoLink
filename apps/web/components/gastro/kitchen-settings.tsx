'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChefHat,
  Loader2,
  Save,
  Check,
  Plus,
  Trash2,
  Printer,
  AlertCircle,
  Copy,
  RefreshCw,
  Wifi,
  WifiOff,
  GripVertical,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';

interface KitchenStation {
  id: string;
  name: string;
  displayName: string;
  printerId: string | null;
  printerName: string | null;
  isActive: boolean;
  order: number;
  _count?: { products: number; comandas: number };
}

interface ProductMap {
  id: string;
  name: string;
  kitchenStationId: string | null;
  categoryId: string | null;
}

export function KitchenSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [products, setProducts] = useState<ProductMap[]>([]);
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [agentConnected, setAgentConnected] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', displayName: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tab, setTab] = useState<'stations' | 'products' | 'agent'>('stations');

  const getApi = useCallback(() => {
    if (!session?.accessToken) return null;
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  const loadData = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    try {
      const [stationsData, productsData, tenantData] = await Promise.all([
        api.getKitchenStations(),
        api.getKitchenProductMap(),
        api.getTenant(),
      ]);
      setStations(stationsData);
      setProducts(productsData);

      const settings = typeof tenantData.settings === 'string'
        ? JSON.parse(tenantData.settings)
        : (tenantData.settings || {});
      if (settings.gastroConfig?.agentToken) {
        setAgentToken(settings.gastroConfig.agentToken);
      }
    } catch (err) {
      console.error('Error loading kitchen data:', err);
    } finally {
      setLoading(false);
    }
  }, [getApi]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateStation = async () => {
    const api = getApi();
    if (!api || !newStation.name.trim()) return;

    setSaving(true);
    try {
      await api.createKitchenStation({
        name: newStation.name.trim(),
        displayName: newStation.displayName.trim() || newStation.name.trim().toUpperCase(),
      });
      setNewStation({ name: '', displayName: '' });
      setShowNewForm(false);
      await loadData();
    } catch (err) {
      console.error('Error creating station:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    const api = getApi();
    if (!api) return;
    if (!confirm('¿Eliminar esta estación? Los productos asignados quedarán sin estación.')) return;

    try {
      await api.deleteKitchenStation(stationId);
      await loadData();
    } catch (err) {
      console.error('Error deleting station:', err);
    }
  };

  const handleToggleStation = async (stationId: string, isActive: boolean) => {
    const api = getApi();
    if (!api) return;
    try {
      await api.updateKitchenStation(stationId, { isActive: !isActive });
      await loadData();
    } catch (err) {
      console.error('Error toggling station:', err);
    }
  };

  const handleAssignProduct = async (productId: string, stationId: string | null) => {
    const api = getApi();
    if (!api) return;
    try {
      await api.bulkAssignKitchenProducts({
        assignments: [{ productId, kitchenStationId: stationId }],
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, kitchenStationId: stationId } : p)),
      );
    } catch (err) {
      console.error('Error assigning product:', err);
    }
  };

  const handleGenerateToken = async () => {
    const api = getApi();
    if (!api) return;
    setGeneratingToken(true);
    try {
      const result = await api.generateKitchenAgentToken();
      setAgentToken(result.token);
    } catch (err) {
      console.error('Error generating token:', err);
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyToken = () => {
    if (agentToken) {
      navigator.clipboard.writeText(agentToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando cocina...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'stations' as const, label: 'Estaciones', icon: ChefHat },
    { key: 'products' as const, label: 'Productos', icon: GripVertical },
    { key: 'agent' as const, label: 'Agente', icon: Printer },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB: Estaciones */}
      {tab === 'stations' && (
        <div className="space-y-4">
          <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-600" />
                    Estaciones de cocina
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cada estación tiene su propia impresora. Los pedidos se separan automáticamente.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* New station form */}
              {showNewForm && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1 block">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={newStation.name}
                        onChange={(e) => setNewStation((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Cocina Caliente"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1 block">
                        Nombre en ticket
                      </label>
                      <input
                        type="text"
                        value={newStation.displayName}
                        onChange={(e) => setNewStation((prev) => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Ej: COCINA CALIENTE"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateStation}
                      disabled={saving || !newStation.name.trim()}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Crear
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowNewForm(false); setNewStation({ name: '', displayName: '' }); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Station list */}
              {stations.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
                    Sin estaciones configuradas
                  </p>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                    Agregá estaciones para que los pedidos se impriman automáticamente en cada sector.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        station.isActive
                          ? 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                          : 'border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 opacity-60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {station.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                          Ticket: {station.displayName}
                          {station._count?.products ? ` · ${station._count.products} productos` : ''}
                          {station.printerName ? ` · ${station.printerName}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {station.printerId ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <Wifi className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-neutral-500">
                            <WifiOff className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <button
                          onClick={() => handleToggleStation(station.id, station.isActive)}
                          className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                            station.isActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-neutral-600'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            station.isActive ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`} />
                        </button>

                        <button
                          onClick={() => handleDeleteStation(station.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: Productos */}
      {tab === 'products' && (
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-amber-600" />
                Asignación de productos
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Indicá a qué estación va cada producto. Los no asignados van a la primera estación.
              </p>
            </div>

            {stations.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Primero creá al menos una estación de cocina.
                </p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No hay productos cargados.</p>
            ) : (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700/30 transition-colors"
                  >
                    <span className="flex-1 text-sm text-slate-800 dark:text-neutral-200 truncate">
                      {product.name}
                    </span>
                    <select
                      value={product.kitchenStationId || ''}
                      onChange={(e) => handleAssignProduct(product.id, e.target.value || null)}
                      className="w-40 text-xs bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="">Sin asignar</option>
                      {stations.filter((s) => s.isActive).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB: Agente de impresión */}
      {tab === 'agent' && (
        <div className="space-y-4">
          <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-600" />
                  Agente de impresión
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Instalá el agente en la PC del local para imprimir comandas automáticamente.
                </p>
              </div>

              {/* Connection status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                agentConnected
                  ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10'
                  : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800'
              }`}>
                <div className={`w-3 h-3 rounded-full ${agentConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-600'}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                  {agentConnected ? 'Agente conectado' : 'Agente desconectado'}
                </span>
              </div>

              {/* Token section */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-700 dark:text-neutral-300">
                  Token de vinculación
                </p>

                {agentToken ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2.5 bg-slate-100 dark:bg-neutral-700 rounded-lg text-xs font-mono text-slate-700 dark:text-neutral-300 truncate">
                      {agentToken}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToken}
                      className="flex-shrink-0"
                    >
                      {tokenCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateToken}
                      disabled={generatingToken}
                      className="flex-shrink-0"
                    >
                      {generatingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {generatingToken ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                    Generar token
                  </Button>
                )}

                <p className="text-xs text-slate-400 dark:text-neutral-500">
                  Ingresá este token en el programa agente para vincularlo con tu local.
                  Si generás uno nuevo, el anterior deja de funcionar.
                </p>
              </div>

              {/* Download agent */}
              <div className="pt-2 border-t border-slate-200 dark:border-neutral-700">
                <p className="text-xs font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Descargar agente
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Windows (.exe)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Mac (.dmg)
                  </Button>
                </div>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Próximamente disponible para descarga.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
