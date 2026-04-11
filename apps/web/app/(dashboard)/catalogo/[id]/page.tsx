'use client';

import ProductForm from '../_components/product-form';

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />;
}
