import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta — TurnoLink',
  description: 'Registrate gratis en TurnoLink. Sistema de gestión para tu negocio: turnos, ventas, finanzas y más. Empezá en 5 minutos.',
  alternates: {
    canonical: 'https://turnolink.com.ar/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
