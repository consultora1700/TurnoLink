import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TurnoLink API — Integrá reservas y turnos en tu plataforma',
  alternates: {
    canonical: 'https://turnolink.com.ar/integrar',
  },
};

export default function IntegrarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
