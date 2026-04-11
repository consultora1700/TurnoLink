'use client';

import { useState } from 'react';
import { publicApi } from '@/lib/api';
import type { Quote } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface QuoteViewProps {
  initialQuote: Quote;
  token: string;
}

export default function QuoteView({ initialQuote, token }: QuoteViewProps) {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

  const handleRespond = async (action: 'ACCEPTED' | 'REJECTED') => {
    if (!token || responding) return;
    setResponding(true);
    try {
      const updated = await publicApi.respondToQuote(token, action);
      setQuote(updated);
      setResponded(true);
    } catch (e: any) {
      alert(e.message || 'Error al responder');
    } finally {
      setResponding(false);
    }
  };

  const tenant = quote.tenant;
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date() && !['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(quote.status);
  const canRespond = ['SENT', 'VIEWED'].includes(quote.status) && !isExpired;
  const wasAccepted = quote.status === 'ACCEPTED';
  const wasRejected = quote.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Business Header */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white">
            <div className="flex items-center gap-4">
              {tenant?.logo && (
                <img src={tenant.logo} alt={tenant.name} className="h-14 w-14 rounded-xl object-cover border-2 border-white/30 shrink-0" />
              )}
              <div>
                <h1 className="text-xl font-bold">{tenant?.name || 'Comercio'}</h1>
                {tenant?.address && (
                  <p className="text-sm text-white/70 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {tenant.address}{tenant.city ? `, ${tenant.city}` : ''}
                  </p>
                )}
                {tenant?.phone && (
                  <p className="text-sm text-white/70 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {tenant.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quote info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presupuesto</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{quote.title || quote.quoteNumber}</p>
                <p className="text-sm text-slate-500 mt-1 font-mono">{quote.quoteNumber}</p>
              </div>
              {wasAccepted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Aceptado
                </div>
              )}
              {wasRejected && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                  <XCircle className="h-4 w-4" /> Rechazado
                </div>
              )}
              {isExpired && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                  <Clock className="h-4 w-4" /> Vencido
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-5">
              <span>Fecha: {format(new Date(quote.createdAt), "d 'de' MMMM yyyy", { locale: es })}</span>
              {quote.validUntil && (
                <span>Valido hasta: {format(new Date(quote.validUntil), "d 'de' MMMM yyyy", { locale: es })}</span>
              )}
            </div>

            {/* Customer */}
            <div className="mb-5 p-3 rounded-lg bg-slate-50">
              <p className="text-xs font-semibold text-slate-400 mb-1">PARA</p>
              <p className="font-semibold text-slate-800">{quote.customerName}</p>
              {quote.customerPhone && <p className="text-sm text-slate-500">{quote.customerPhone}</p>}
              {quote.customerEmail && <p className="text-sm text-slate-500">{quote.customerEmail}</p>}
            </div>

            {quote.notes && (
              <div className="mb-5 p-3 rounded-lg bg-blue-50 text-sm text-blue-800">
                {quote.notes}
              </div>
            )}

            {/* Items */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detalle</p>
              <div className="divide-y">
                {quote.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                      <p className="text-sm text-slate-400">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                    </div>
                    <p className="font-semibold text-slate-800 ml-4">{formatPrice(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="max-w-xs ml-auto space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">{formatPrice(quote.subtotal)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Descuento</span>
                    <span className="text-green-600">-{formatPrice(quote.discount)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-slate-800">Total</span>
                  <span className="text-teal-600">{formatPrice(quote.total)}</span>
                </div>
              </div>
            </div>

            {quote.terms && (
              <div className="mt-5 p-3 rounded-lg bg-slate-50">
                <p className="text-xs font-semibold text-slate-400 mb-1">TERMINOS Y CONDICIONES</p>
                <p className="text-xs text-slate-500 whitespace-pre-line">{quote.terms}</p>
              </div>
            )}
          </div>

          {/* Response buttons */}
          {canRespond && !responded && (
            <div className="border-t p-6">
              <p className="text-center text-sm text-slate-500 mb-4">Queres aceptar este presupuesto?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('ACCEPTED')}
                  disabled={responding}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {responding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Aceptar presupuesto
                </button>
                <button
                  onClick={() => handleRespond('REJECTED')}
                  disabled={responding}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  Rechazar
                </button>
              </div>
            </div>
          )}

          {/* Response confirmation */}
          {responded && (
            <div className={cn('border-t p-6 text-center', wasAccepted ? 'bg-green-50' : 'bg-red-50')}>
              {wasAccepted ? (
                <>
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-700">Presupuesto aceptado</p>
                  <p className="text-sm text-green-600 mt-1">El comercio recibira tu respuesta.</p>
                </>
              ) : (
                <>
                  <XCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-red-700">Presupuesto rechazado</p>
                  <p className="text-sm text-red-600 mt-1">El comercio recibira tu respuesta.</p>
                </>
              )}
            </div>
          )}

          {/* Expired banner */}
          {isExpired && (
            <div className="border-t p-6 text-center bg-amber-50">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-amber-700">Este presupuesto ha vencido</p>
              <p className="text-sm text-amber-600 mt-1">
                Contacta a {tenant?.name} para solicitar uno nuevo.
              </p>
              {tenant?.phone && (
                <a
                  href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" /> Contactar por WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Presupuesto generado por {tenant?.name} via TurnoLink
        </p>
      </div>
    </div>
  );
}
