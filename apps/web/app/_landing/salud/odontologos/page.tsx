import type { Metadata } from 'next';
import { OdontologosLanding } from './odontologos-landing';
import { fetchPricingByGroup } from '../../_components/pricing-api';

export const metadata: Metadata = {
  title: 'TurnoLink para Odontólogos — Agenda Online, Ficha Dental, Cobro Automático y Recordatorios',
  description:
    'La plataforma que eligen odontólogos para automatizar su consultorio. Agenda online 24/7, ficha clínica con odontograma e historial, cobro de consultas sin incomodidad, recordatorios que eliminan ausencias y gestión de tratamientos. Probá 14 días gratis.',
  keywords: [
    'turnos odontologo online',
    'agenda odontologo digital',
    'software odontologia argentina',
    'sistema turnos dentista',
    'ficha paciente odontologo',
    'consultorio dental online',
    'cobro consulta odontologia',
    'recordatorio turno dentista',
    'gestion consultorio dental',
    'agenda dentista automatica',
    'turnos odontologia online',
  ],
  openGraph: {
    title: 'TurnoLink para Odontólogos — Agenda Online, Ficha Dental y Cobro Automático',
    description:
      'Agenda online con ficha clínica dental, cobro automático, recordatorios y gestión de tratamientos. Para odontólogos que quieren enfocarse en sus pacientes, no en la administración.',
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/salud/odontologos',
  },
};

export default async function OdontologosPage() {
  const pricing = await fetchPricingByGroup('salud');
  return <OdontologosLanding dynamicPricing={pricing?.tiers} />;
}
