import type { Metadata } from 'next';
import { PsicologosLanding } from './psicologos-landing';
import { fetchPricingByGroup } from '../../_components/pricing-api';

export const metadata: Metadata = {
  title: 'TurnoLink para Psicólogos — Agenda con Videollamadas, Cobro Automático y Ficha de Paciente',
  description:
    'La plataforma que eligen psicólogos para automatizar su consultorio. Videollamadas con Zoom y Google Meet, cobro de honorarios sin incomodidad, recordatorios que eliminan ausencias, ficha clínica completa y agenda online 24/7. Probá 14 días gratis.',
  keywords: [
    'turnos psicologo online',
    'agenda psicologo digital',
    'videollamada psicologo',
    'software psicologia argentina',
    'consulta psicologica online',
    'terapia online plataforma',
    'sistema turnos salud mental',
    'ficha paciente psicologo',
    'cobro sesion psicologia',
    'recordatorio turno psicologo',
    'consultorio virtual psicologia',
  ],
  openGraph: {
    title: 'TurnoLink para Psicólogos — Agenda con Videollamadas, Cobro Automático y Ficha de Paciente',
    description:
      'Agenda online con videollamadas, cobro automático, ficha clínica y recordatorios. Para psicólogos que quieren dejar de ser secretarios de su propio consultorio.',
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/salud/psicologos',
  },
};

export default async function PsicologosPage() {
  const pricing = await fetchPricingByGroup('salud');
  return <PsicologosLanding dynamicPricing={pricing?.tiers} />;
}
