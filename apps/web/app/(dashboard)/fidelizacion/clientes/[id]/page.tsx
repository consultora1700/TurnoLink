'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function ClienteDetallePage() {
  const { data: session } = useSession();
  const params = useParams();
  const customerId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken || !customerId) return;
    const api = createApiClient(session.accessToken as string);
    api.get(`/loyalty/balances/${customerId}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.accessToken, customerId]);

  if (loading) return <div className="p-6"><div className="h-64 animate-pulse bg-muted rounded-lg" /></div>;
  if (!data) return <div className="p-6"><p>No se encontro el cliente</p></div>;

  const { balance, transactions } = data;

  const typeIcon = (type: string) => {
    if (type === 'EARN') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (type === 'REDEEM') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Settings2 className="h-4 w-4 text-amber-600" />;
  };

  const typeLabel = (type: string) => {
    if (type === 'EARN') return 'Ganado';
    if (type === 'REDEEM') return 'Canjeado';
    return 'Ajuste';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/fidelizacion/clientes" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Detalle de puntos</h1>
      </div>

      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Saldo actual</p>
              <p className="text-3xl font-bold flex items-center gap-2"><Star className="h-6 w-6 text-yellow-500" /> {balance.currentBalance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total ganado</p>
              <p className="text-2xl font-bold text-green-600">{balance.totalEarned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total canjeado</p>
              <p className="text-2xl font-bold text-red-600">{balance.totalRedeemed}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de transacciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Descripcion</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Puntos</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Saldo</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {!transactions?.length ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin transacciones</td></tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {typeIcon(tx.type)}
                          <span className="text-sm">{typeLabel(tx.type)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{tx.description}</td>
                      <td className={`p-3 text-sm text-right font-medium ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </td>
                      <td className="p-3 text-sm text-right">{tx.balanceAfter}</td>
                      <td className="p-3 text-sm text-right text-muted-foreground hidden sm:table-cell">
                        {new Date(tx.createdAt).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
