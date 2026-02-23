'use client';

import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

// Icono Calendario - Diseño único con marcador de día y líneas
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base del calendario */}
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Línea superior del header */}
      <path
        d="M3 9H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Ganchos del calendario */}
      <path
        d="M8 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Día destacado con círculo */}
      <circle
        cx="12"
        cy="15"
        r="3"
        fill="currentColor"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="15"
        r="2"
        fill="currentColor"
      />
      {/* Puntos de días */}
      <circle cx="7" cy="13" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="13" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="17" cy="17" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Icono Reloj 24/7 - Reloj con indicador de "siempre activo"
export function Clock247Icon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo exterior con efecto de brillo */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Círculo interior de brillo */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="4 6"
        opacity="0.3"
        fill="none"
      />
      {/* Manecillas del reloj */}
      <path
        d="M12 6V12L16 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Centro del reloj */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      {/* Indicador de "activo" - pequeño círculo pulsante */}
      <circle
        cx="18"
        cy="6"
        r="2.5"
        fill="currentColor"
        opacity="0.9"
      />
      <circle
        cx="18"
        cy="6"
        r="4"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
    </svg>
  );
}

// Icono Campana/Notificaciones - Con ondas de sonido
export function BellWaveIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Campana principal */}
      <path
        d="M12 3C8.5 3 6 5.5 6 9V14L4 17H20L18 14V9C18 5.5 15.5 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Parte inferior de la campana */}
      <path
        d="M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Badulaque / punto de notificación */}
      <circle
        cx="17"
        cy="6"
        r="3"
        fill="currentColor"
      />
      {/* Ondas de sonido izquierda */}
      <path
        d="M2 10C2.5 9 3 8.5 3 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M1 13C2 12 2.5 11 3 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Ondas de sonido derecha */}
      <path
        d="M22 10C21.5 9 21 8.5 21 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M23 13C22 12 21.5 11 21 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Icono Tarjeta/Pago - Con símbolo de check de verificación
export function CardCheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tarjeta base */}
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Banda magnética */}
      <rect
        x="2"
        y="9"
        width="20"
        height="3"
        fill="currentColor"
        opacity="0.2"
      />
      {/* Líneas de texto simuladas */}
      <rect
        x="5"
        y="15"
        width="6"
        height="1.5"
        rx="0.75"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="5"
        y="17"
        width="4"
        height="1"
        rx="0.5"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Círculo de verificación */}
      <circle
        cx="18"
        cy="16"
        r="4"
        fill="currentColor"
      />
      {/* Check dentro del círculo */}
      <path
        d="M16 16L17.5 17.5L20 14.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icono Paleta/Personalización - Paleta artística con goteo
export function PaletteDropIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Paleta base */}
      <path
        d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C13.5 22 14.5 21 14.5 19.5C14.5 19 14.3 18.5 14 18.1C13.7 17.7 13.5 17.3 13.5 16.8C13.5 15.6 14.5 14.5 15.8 14.5H18C20.2 14.5 22 12.7 22 10.5C22 5.8 17.5 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Gotas de pintura/colores */}
      <circle cx="7.5" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="15" cy="7" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="7" cy="14" r="1.5" fill="currentColor" opacity="0.8" />
      {/* Gotita cayendo */}
      <path
        d="M18 17C18 18.1 18.5 19.5 18 20.5C17.5 21.5 16.5 22 16 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Reflejo */}
      <path
        d="M5 8C5.5 7 6.5 6 8 5.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Icono Estadísticas/Métricas - Gráfico con línea de tendencia y puntos
export function ChartTrendIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-6 h-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Marco del gráfico */}
      <path
        d="M3 3V21H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Barras del gráfico */}
      <rect
        x="6"
        y="14"
        width="3"
        height="5"
        rx="0.5"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="11"
        y="10"
        width="3"
        height="9"
        rx="0.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="16"
        y="6"
        width="3"
        height="13"
        rx="0.5"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Línea de tendencia */}
      <path
        d="M6 13L11 9L16 5L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Puntos en la línea */}
      <circle cx="6" cy="13" r="2" fill="currentColor" />
      <circle cx="11" cy="9" r="2" fill="currentColor" />
      <circle cx="16" cy="5" r="2" fill="currentColor" />
      {/* Flecha de crecimiento */}
      <path
        d="M19 3L21 3L21 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
