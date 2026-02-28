import type { Metadata } from 'next';
import { SaludLanding } from './salud-landing';

export const metadata: Metadata = {
  title: 'TurnoLink para Salud & Profesionales — Agenda Online para Consultorios, Médicos, Odontólogos y Psicólogos',
  description:
    'Sistema de turnos online para consultorios médicos, odontólogos, psicólogos, nutricionistas, kinesiólogos, fonoaudiólogos, abogados, contadores y escribanos. Agenda 24/7, recordatorios automáticos, cobro de señas con Mercado Pago. Probá 14 días gratis.',
  keywords: [
    'turnos consultorio online',
    'agenda médica digital',
    'sistema turnos odontólogo',
    'turnos psicólogo online',
    'cobro señas consultorio',
    'agenda profesional online',
    'turnos kinesiólogo online',
    'sistema turnos nutricionista',
    'agenda fonoaudiólogo',
    'turnos abogado online',
    'sistema agenda contador',
    'reservas consultorio médico',
    'recordatorios pacientes automáticos',
    'cobro seña Mercado Pago consultorio',
  ],
  openGraph: {
    title: 'TurnoLink para Salud & Profesionales — Más consultas, menos teléfono',
    description:
      'Tus pacientes reservan solos. Vos cobrás la seña. Tu agenda se organiza sola. Probá 14 días gratis.',
    type: 'website',
  },
};

export default function SaludPage() {
  return <SaludLanding />;
}
