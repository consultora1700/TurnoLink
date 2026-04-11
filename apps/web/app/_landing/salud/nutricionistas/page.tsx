import type { Metadata } from 'next';
import { NutricionistasLanding } from './nutricionistas-landing';
import { fetchPricingByGroup } from '../../_components/pricing-api';

export const metadata: Metadata = {
  title: 'TurnoLink para Nutricionistas — Agenda Online, Ficha Nutricional, Seguimiento de Pacientes y Cobro Automático',
  description:
    'La plataforma que eligen nutricionistas para automatizar su consultorio. Agenda online 24/7, ficha clínica con peso, altura e historial, seguimiento nutricional con timeline, recordatorios automáticos y cobro de honorarios. Probá 14 días gratis.',
  keywords: [
    'turnos nutricionista online',
    'agenda nutricionista digital',
    'software nutricion argentina',
    'sistema turnos nutricionista',
    'ficha paciente nutricionista',
    'seguimiento nutricional plataforma',
    'plan alimentario digital',
    'cobro consulta nutricion',
    'recordatorio turno nutricionista',
    'consultorio nutricion online',
    'nutricionista agenda automatica',
  ],
  openGraph: {
    title: 'TurnoLink para Nutricionistas — Agenda Online, Ficha Nutricional y Seguimiento de Pacientes',
    description:
      'Agenda online con ficha nutricional completa, seguimiento de pacientes, recordatorios automáticos y cobro de honorarios. Para nutricionistas que quieren enfocarse en sus pacientes, no en la administración.',
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/salud/nutricionistas',
  },
};

export default async function NutricionistasPage() {
  const pricing = await fetchPricingByGroup('salud');
  return <NutricionistasLanding dynamicPricing={pricing?.tiers} />;
}
