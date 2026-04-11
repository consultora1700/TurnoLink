import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TurnoLink para Talento — Conectá con negocios que necesitan profesionales',
  alternates: {
    canonical: 'https://turnolink.com.ar/para/talento',
  },
};

export default function TalentoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
