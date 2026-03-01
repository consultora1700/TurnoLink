'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReportParams } from '@/lib/api';

export function ExportCsvButton({ params }: { params: ReportParams }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const queryParts = Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
      const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      const response = await fetch(`${API_URL}/api/reports/export/csv${query}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes-turnos.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Exportar CSV
    </Button>
  );
}
