import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'TurnoLink API — Integra reservas y turnos en tu plataforma',
  alternates: {
    canonical: 'https://turnolink.com.ar/integrar',
  },
};

export default function IntegrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      {children}
    </div>
  );
}
