import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorar Talento Profesional | TurnoLink',
  description:
    'Encontra profesionales verificados para tu negocio. Estilistas, barberos, dentistas, nutricionistas, personal trainers y mas. El talento que necesitas en TurnoLink.',
  keywords: [
    'talento profesional',
    'buscar profesionales',
    'contratar estilistas',
    'contratar barberos',
    'profesionales belleza',
    'dentista turnos',
    'nutricionista turnos',
    'personal trainer',
    'veterinaria turnos',
    'TurnoLink talento',
  ],
  openGraph: {
    title: 'Explorar Talento Profesional | TurnoLink',
    description:
      'Encontra profesionales verificados para tu negocio. Belleza, salud, fitness, educacion y mas.',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function ExplorarTalentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
