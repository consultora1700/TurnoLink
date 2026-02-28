import type { Metadata } from 'next';
import { AlquilerLanding } from './alquiler-landing';

export const metadata: Metadata = {
  title: 'TurnoLink para Alquiler Temporario — Reservas por Día para Cabañas, Quintas y Departamentos',
  description:
    'Sistema de reservas para casas quinta, cabañas, departamentos temporarios, campos recreativos, salones por día, quinchos y espacios para eventos. Calendario por día, cobro de señas con Mercado Pago, precios por temporada, estadía mínima. Probá 14 días gratis.',
  keywords: [
    'sistema reservas cabañas',
    'reservas departamento temporario',
    'cobro señas alquiler temporario',
    'calendario reservas por día',
    'gestión propiedades temporarias',
    'sistema reservas quincho',
    'alquiler casa quinta online',
    'reservas campo recreativo',
    'sistema alquiler salón por día',
    'reservas espacios para eventos',
    'cobro seña Mercado Pago alquiler',
    'precios por temporada cabañas',
    'estadía mínima sistema reservas',
    'gestión alquiler temporario Argentina',
    'software propiedades alquiler día',
    'reservas quinchos online',
  ],
  openGraph: {
    title: 'TurnoLink para Alquiler Temporario — Reservas confirmadas, cobros asegurados',
    description:
      'Calendario por día, cobro de seña automático y precios por temporada. Probá 14 días gratis.',
    type: 'website',
  },
};

export default function AlquilerTemporarioPage() {
  return <AlquilerLanding />;
}
