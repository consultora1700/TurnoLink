import type { Metadata } from 'next';
import { MercadoLanding } from './mercado-landing';
import { MERCADO_FAQS } from './mercado-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink Mercado — Catálogo Online para Tiendas, Inmobiliarias y Emprendedores',
  description:
    'Creá tu catálogo profesional en minutos. Publicá productos con fotos, precios y stock. Tus clientes te contactan por WhatsApp o pagan con Mercado Pago. Gestión de stock automática, métricas y reportes. 14 días gratis.',
  keywords: [
    'catálogo online Argentina',
    'tienda online WhatsApp',
    'catálogo digital productos',
    'vender por WhatsApp Argentina',
    'catálogo inmobiliaria online',
    'gestión stock online',
    'catálogo profesional emprendedores',
    'vender productos online Argentina',
    'mercado pago tienda online',
    'catálogo ropa online',
    'catálogo alimentos online',
    'stock automático tienda',
    'página productos WhatsApp',
    'sistema ventas emprendedores',
  ],
  openGraph: {
    title: 'TurnoLink Mercado — Tu catálogo profesional, tus ventas en piloto automático',
    description:
      'Publicá tus productos. Tus clientes los ven y te contactan por WhatsApp o pagan con Mercado Pago. Stock automático. 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/mercado`,
  },
};

export default async function MercadoPage() {
  const pricing = await fetchPricingByGroup('mercado');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Mercado', url: `${SITE_URL}/mercado` },
      ]} />
      <FaqJsonLd faqs={MERCADO_FAQS} />
      <MercadoLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
