import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: undefined as any, // Remove PWA manifest — this page is for customers, not app users
  title: 'Dejar reseña | TurnoLink',
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
