'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  QrCode,
  Download,
  Loader2,
  Plus,
  Minus,
  Save,
  Printer,
  RefreshCw,
  Trash2,
  ExternalLink,
  Check,
  Copy,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createApiClient } from '@/lib/api';

interface QrTable {
  tableNumber: number;
  url: string;
  dataUrl?: string;
}

export function QrGenerator() {
  const { data: session } = useSession();
  const [tables, setTables] = useState<QrTable[]>([]);
  const [tableCount, setTableCount] = useState(0);
  const [inputCount, setInputCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<number | null>(null);

  const getApi = useCallback(() => {
    if (!session?.accessToken) return null;
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  // Load config & auto-generate QRs
  useEffect(() => {
    const api = getApi();
    if (!api) return;

    api.getGastroQrData().then(async (data) => {
      setTableCount(data.tableCount);
      setInputCount(data.tableCount);

      // Auto-generate QR codes on load
      if (data.tables.length > 0) {
        const withQrs = await Promise.all(
          data.tables.map(async (table: QrTable) => {
            const dataUrl = await QRCode.toDataURL(table.url, {
              width: 400,
              margin: 2,
              color: { dark: '#1a1a1a', light: '#ffffff' },
              errorCorrectionLevel: 'H',
            });
            return { ...table, dataUrl };
          }),
        );
        setTables(withQrs);
      } else {
        setTables(data.tables);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [getApi]);

  const handleSaveCount = useCallback(async () => {
    const api = getApi();
    if (!api || inputCount === tableCount) return;

    setSaving(true);
    try {
      const tenant = await api.getTenant();
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : (tenant.settings || {});

      settings.gastroConfig = {
        ...settings.gastroConfig,
        tableCount: inputCount,
      };

      await api.updateTenant({ settings: JSON.stringify(settings) } as any);
      setTableCount(inputCount);

      // Reload & auto-generate
      const data = await api.getGastroQrData();
      if (data.tables.length > 0) {
        const withQrs = await Promise.all(
          data.tables.map(async (table: QrTable) => {
            const dataUrl = await QRCode.toDataURL(table.url, {
              width: 400,
              margin: 2,
              color: { dark: '#1a1a1a', light: '#ffffff' },
              errorCorrectionLevel: 'H',
            });
            return { ...table, dataUrl };
          }),
        );
        setTables(withQrs);
      } else {
        setTables([]);
      }
    } catch (err) {
      console.error('Error saving table count:', err);
    } finally {
      setSaving(false);
    }
  }, [getApi, inputCount, tableCount]);

  const regenerateAll = useCallback(async () => {
    setGenerating(true);
    try {
      const withQrs = await Promise.all(
        tables.map(async (table) => {
          const dataUrl = await QRCode.toDataURL(table.url, {
            width: 400,
            margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' },
            errorCorrectionLevel: 'H',
          });
          return { ...table, dataUrl };
        }),
      );
      setTables(withQrs);
    } catch (err) {
      console.error('Error generating QRs:', err);
    } finally {
      setGenerating(false);
    }
  }, [tables]);

  const downloadQr = useCallback((table: QrTable) => {
    if (!table.dataUrl) return;
    const link = document.createElement('a');
    link.download = `mesa-${table.tableNumber}-qr.png`;
    link.href = table.dataUrl;
    link.click();
  }, []);

  const copyUrl = useCallback((table: QrTable) => {
    navigator.clipboard.writeText(table.url).then(() => {
      setCopiedUrl(table.tableNumber);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }, []);

  const printAll = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrHtml = tables
      .filter((t) => t.dataUrl)
      .map(
        (t) => `
        <div style="display:inline-block;text-align:center;margin:24px;page-break-inside:avoid;">
          <div style="background:#f8f9fa;border-radius:16px;padding:20px;border:1px solid #e2e8f0;">
            <img src="${t.dataUrl}" width="180" height="180" style="border-radius:8px;" />
            <p style="font-family:-apple-system,sans-serif;font-size:20px;font-weight:700;margin:12px 0 4px;color:#0f172a;">
              Mesa ${t.tableNumber}
            </p>
            <p style="font-family:-apple-system,sans-serif;font-size:10px;color:#94a3b8;margin:0;word-break:break-all;">
              ${t.url}
            </p>
          </div>
        </div>`,
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head><title>QR Mesas</title></head>
        <body style="padding:20px;background:white;">
          <h1 style="font-family:-apple-system,sans-serif;text-align:center;margin-bottom:30px;color:#0f172a;">
            Códigos QR — Mesas
          </h1>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;">
            ${qrHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }, [tables]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table count config */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                Cantidad de mesas
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurá cuántas mesas tiene tu salón. Se generará un QR para cada una.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 dark:bg-neutral-700/60 rounded-xl p-1">
                <button
                  onClick={() => setInputCount(Math.max(0, inputCount - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-600 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
                </button>
                <input
                  type="number"
                  value={inputCount}
                  onChange={(e) => setInputCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 text-center py-2 bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0}
                />
                <button
                  onClick={() => setInputCount(inputCount + 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-600 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
                </button>
              </div>

              {inputCount !== tableCount && (
                <Button
                  onClick={handleSaveCount}
                  disabled={saving}
                  className="h-10 bg-amber-600 hover:bg-amber-700 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Guardar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR codes grid */}
      {tableCount > 0 && (
        <>
          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {tableCount} {tableCount === 1 ? 'código' : 'códigos'} QR
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                Generados
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={regenerateAll}
                disabled={generating}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                Regenerar
              </Button>
              {tables.some((t) => t.dataUrl) && (
                <Button onClick={printAll} size="sm" variant="outline" className="text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Imprimir todos
                </Button>
              )}
            </div>
          </div>

          {/* QR grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <Card
                key={table.tableNumber}
                className="group border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-neutral-800"
              >
                <CardContent className="p-0">
                  {/* QR image */}
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-700 dark:to-neutral-800 p-6 flex items-center justify-center">
                    {table.dataUrl ? (
                      <img
                        src={table.dataUrl}
                        alt={`QR Mesa ${table.tableNumber}`}
                        className="w-full max-w-[200px] aspect-square rounded-lg"
                      />
                    ) : (
                      <div className="w-[200px] aspect-square rounded-lg bg-slate-200 dark:bg-neutral-600 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-slate-300 dark:text-neutral-500" />
                      </div>
                    )}

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        {table.dataUrl && (
                          <button
                            onClick={() => downloadQr(table)}
                            className="p-2.5 rounded-xl bg-white/90 dark:bg-neutral-800/90 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4 text-slate-700 dark:text-neutral-200" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Mesa {table.tableNumber}
                      </h4>
                      {table.dataUrl && (
                        <button
                          onClick={() => downloadQr(table)}
                          className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium"
                        >
                          <Download className="w-3 h-3" />
                          PNG
                        </button>
                      )}
                    </div>

                    {/* URL with copy */}
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-700/50 rounded-lg px-3 py-2 group/url">
                      <ExternalLink className="w-3 h-3 text-slate-400 dark:text-neutral-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate flex-1 font-mono">
                        {table.url}
                      </span>
                      <button
                        onClick={() => copyUrl(table)}
                        className="flex-shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors"
                        title="Copiar enlace"
                      >
                        {copiedUrl === table.tableNumber ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty state when no tables */}
      {tableCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configurá tus mesas
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Ingresá la cantidad de mesas que tiene tu salón para generar los códigos QR que tus clientes van a escanear.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
