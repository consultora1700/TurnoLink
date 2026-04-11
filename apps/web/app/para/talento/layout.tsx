import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'TurnoLink para Talento — Conecta con negocios que necesitan profesionales',
  alternates: {
    canonical: 'https://turnolink.com.ar/para/talento',
  },
};

export default function TalentoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      {children}
    </div>
  );
}
