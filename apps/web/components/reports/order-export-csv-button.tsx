'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { ReportParams } from '@/lib/api';

export function OrderExportCsvButton({ params }: { params?: ReportParams }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params?.period) searchParams.set('period', params.period);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/orders/export/csv${qs}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) throw new Error('Error al exportar');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes-pedidos.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      Exportar CSV
    </Button>
  );
}
