'use client';

import { useState } from 'react';
import { ChevronDown, Loader2, Copy, Check, Bike, User2, Phone as PhoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import type { Order, DeliveryStaffMember } from '@/lib/api';

interface Props {
  order: Order;
  deliveryStaff: DeliveryStaffMember[];
  onAssign: (orderId: string, employeeId: string | null) => Promise<void>;
}

export function DeliveryAssignBlock({ order, deliveryStaff, onAssign }: Props) {
  const [assigning, setAssigning] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = (order as any).deliveryToken as string | undefined;
  const assigned = order.deliveryEmployee;

  const url =
    typeof window !== 'undefined' && token
      ? `${window.location.origin}/delivery/${token}`
      : '';

  const buildWhatsappMessage = () => {
    const addressRaw = (order as any).shippingAddress;
    let address = '';
    if (addressRaw) {
      try {
        const obj = JSON.parse(addressRaw);
        address = [obj.street, obj.number, obj.apartment, obj.city]
          .filter(Boolean)
          .join(', ');
      } catch {
        address = addressRaw;
      }
    }
    const lines = [
      `Hola ${assigned?.name || ''}! 👋`,
      '',
      'Tenés un pedido para entregar:',
      '',
      `📦 Pedido ${order.orderNumber}`,
      `👤 Cliente: ${order.customerName}`,
    ];
    if (address) lines.push(`📍 ${address}`);
    if (order.customerPhone) lines.push(`📱 ${order.customerPhone}`);
    lines.push(`💰 Total: $${order.total.toLocaleString('es-AR')}`);
    lines.push('');
    lines.push('Abrí este link para ver detalles y marcar los estados:');
    lines.push(url);
    return lines.join('\n');
  };

  // Normaliza un teléfono argentino al formato internacional para wa.me
  // Acepta: "1124506579", "011 2450-6579", "11 15 2450 6579", "+54 9 11 2450 6579", etc.
  // Devuelve: "5491124506579"
  const normalizeArgPhoneForWhatsapp = (raw: string): string => {
    let d = raw.replace(/[^\d]/g, '');
    // Quitar prefijo internacional si vino con +54 / 0054
    if (d.startsWith('0054')) d = d.slice(4);
    if (d.startsWith('54')) d = d.slice(2);
    // Quitar 0 inicial de área (ej: 011 → 11)
    if (d.startsWith('0')) d = d.slice(1);
    // Quitar 15 de celular viejo argentino (ej: 11 15 2450... → 11 2450...)
    // Heurística: si después del código de área (2-4 dígitos) viene "15", lo quitamos
    // Caso CABA: 11 15XXXXXXXX (12 dígitos) → 11 XXXXXXXX
    if (d.length === 12 && d.startsWith('11') && d.substring(2, 4) === '15') {
      d = '11' + d.substring(4);
    }
    // Para otras áreas (3 o 4 dígitos), mismo patrón
    if (d.length >= 12 && d.substring(2, 4) === '15' && !d.startsWith('11')) {
      // No tocamos: ambiguo sin tabla de áreas. El usuario puede cargar bien.
    }
    // Agregar "9" obligatorio para móviles argentinos en WhatsApp
    if (!d.startsWith('9')) d = '9' + d;
    // Agregar código país
    return '54' + d;
  };

  const handleSendWhatsapp = () => {
    if (!assigned?.phone) {
      toast({
        title: 'Sin teléfono',
        description: 'Este repartidor no tiene teléfono cargado en su perfil',
        variant: 'destructive',
      });
      return;
    }
    const waPhone = normalizeArgPhoneForWhatsapp(assigned.phone);
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
      buildWhatsappMessage(),
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Link copiado' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error al copiar', variant: 'destructive' });
    }
  };

  const handleSelectStaff = async (employeeId: string) => {
    setAssigning(true);
    try {
      await onAssign(order.id, employeeId);
    } finally {
      setAssigning(false);
    }
  };

  if (!token) return null;

  if (!assigned) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-full sm:w-auto h-12 px-5 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={assigning}
          >
            {assigning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bike className="h-4 w-4" />
            )}
            Asignar repartidor
            <ChevronDown className="h-4 w-4 opacity-80" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 p-2"
          sideOffset={8}
        >
          {deliveryStaff.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <Bike className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Sin repartidores cargados</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Andá a <strong>Empleados</strong> y marcá al menos uno como
                repartidor para poder asignarlo.
              </p>
            </div>
          ) : (
            <>
              <div className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                Elegí un repartidor
              </div>
              {deliveryStaff.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => handleSelectStaff(d.id)}
                  className="rounded-lg p-2.5 cursor-pointer focus:bg-orange-50 dark:focus:bg-orange-950/30"
                >
                  <div className="flex items-center gap-3 w-full">
                    {d.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.image}
                        alt={d.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0 border border-orange-200 dark:border-orange-800/50"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 flex items-center justify-center shrink-0">
                        <User2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">
                        {d.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {d.deliveryVehicle && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                            <Bike className="h-2.5 w-2.5" />
                            {d.deliveryVehicle}
                          </span>
                        )}
                        {d.phone ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <PhoneIcon className="h-2.5 w-2.5" />
                            {d.phone}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-500">
                            sin tel.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="w-full sm:w-auto rounded-xl border border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-3">
      <div className="flex items-center gap-3 mb-2.5">
        {(assigned as any).image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(assigned as any).image}
            alt={assigned.name}
            className="h-10 w-10 rounded-full object-cover shadow-sm shrink-0 border-2 border-white dark:border-neutral-900"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm shrink-0">
            <Bike className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-orange-600/70 dark:text-orange-400/70 font-semibold">
            Repartidor asignado
          </p>
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {assigned.name}
          </p>
        </div>
        <button
          onClick={() => handleSelectStaff('')}
          className="text-[10px] text-muted-foreground hover:text-red-600 underline shrink-0"
          title="Quitar asignación"
        >
          cambiar
        </button>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-semibold shadow-sm"
          onClick={handleSendWhatsapp}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          WhatsApp
        </Button>
        <Button
          variant="outline"
          className="h-11 px-3"
          onClick={handleCopy}
          title="Copiar link"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
