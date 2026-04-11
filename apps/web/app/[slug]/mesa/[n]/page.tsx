import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { MesaExperience } from '@/components/gastro/mesa-experience';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Force dynamic — menu data must always be fresh
export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string; n: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const tenant = await publicApi.getTenant(params.slug);
    return {
      title: `Mesa ${params.n} — ${tenant.name}`,
      description: `Pedí desde tu mesa en ${tenant.name}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: 'Mesa no encontrada' };
  }
}

export default async function MesaPage({ params }: Props) {
  const tableNumber = parseInt(params.n, 10);
  if (isNaN(tableNumber) || tableNumber < 1) {
    notFound();
  }

  let tenant;
  try {
    tenant = await publicApi.getTenant(params.slug);
  } catch {
    notFound();
  }

  // Fetch products for the menu
  let products: any[] = [];
  let categories: any[] = [];
  try {
    [products, categories] = await Promise.all([
      publicApi.getProducts(params.slug),
      publicApi.getProductCategories(params.slug),
    ]);
  } catch {}

  return (
    <MesaExperience
      tenant={tenant}
      slug={params.slug}
      tableNumber={tableNumber}
      products={products}
      categories={categories}
    />
  );
}
