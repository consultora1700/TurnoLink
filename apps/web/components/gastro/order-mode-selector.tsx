'use client';

import { ShoppingBag, Truck, CalendarDays, Check } from 'lucide-react';
import type { OrderType } from '@/lib/gastro-cart-store';

interface Props {
  orderType: OrderType | null;
  onSelectType: (type: OrderType) => void;
  onReserveTable?: () => void;
  primaryColor: string;
  showReservation?: boolean;
}

export function OrderModeSelector({ orderType, onSelectType, onReserveTable, showReservation = true }: Props) {
  const hasReservation = showReservation && onReserveTable;
  const totalButtons = hasReservation ? 3 : 2;

  return (
    <div className="w-full space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 text-center">
        ¿Cómo querés tu pedido?
      </p>
      <div className={`grid ${totalButtons === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
        {/* Para llevar */}
        <ModeButton
          isActive={orderType === 'TAKE_AWAY'}
          onClick={() => onSelectType('TAKE_AWAY')}
          icon={ShoppingBag}
          label="Para llevar"
          desc="Retirá en el local"
        />

        {/* Delivery */}
        <ModeButton
          isActive={orderType === 'DELIVERY'}
          onClick={() => onSelectType('DELIVERY')}
          icon={Truck}
          label="Delivery"
          desc="Te lo llevamos"
        />

        {/* Reservar mesa */}
        {hasReservation && (
          <ModeButton
            isActive={false}
            onClick={onReserveTable!}
            icon={CalendarDays}
            label="Reservar"
            desc="Reservá tu lugar"
          />
        )}
      </div>
    </div>
  );
}

function ModeButton({ isActive, onClick, icon: Icon, label, desc }: {
  isActive: boolean;
  onClick: () => void;
  icon: typeof ShoppingBag;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
        isActive
          ? 'border-[hsl(var(--tenant-primary-500))] bg-gradient-to-b from-[hsl(var(--tenant-primary-500)_/_0.08)] to-[hsl(var(--tenant-primary-500)_/_0.02)] dark:from-[hsl(var(--tenant-primary-500)_/_0.2)] dark:to-[hsl(var(--tenant-primary-500)_/_0.05)] shadow-[0_2px_12px_hsl(var(--tenant-primary-500)_/_0.15)] scale-[1.02]'
          : 'border-slate-200/80 dark:border-neutral-700/80 hover:border-slate-300 dark:hover:border-neutral-600 bg-white/80 dark:bg-neutral-800/80 hover:shadow-sm active:scale-[0.98]'
      }`}
    >
      {/* Active check */}
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[hsl(var(--tenant-primary-500))] rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
        isActive
          ? 'bg-[hsl(var(--tenant-primary-500))] shadow-sm'
          : 'bg-slate-100 dark:bg-neutral-700'
      }`}>
        <Icon className={`w-4 h-4 transition-colors ${
          isActive ? 'text-white' : 'text-slate-500 dark:text-neutral-400'
        }`} />
      </div>

      {/* Text */}
      <div className="text-center">
        <span className={`text-xs font-semibold block transition-colors ${
          isActive
            ? 'text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]'
            : 'text-slate-700 dark:text-neutral-300'
        }`}>
          {label}
        </span>
        <span className={`text-[9px] leading-tight mt-0.5 block transition-colors ${
          isActive
            ? 'text-[hsl(var(--tenant-primary-600)_/_0.7)] dark:text-[hsl(var(--tenant-primary-400)_/_0.7)]'
            : 'text-slate-400 dark:text-neutral-500'
        }`}>
          {desc}
        </span>
      </div>
    </button>
  );
}
