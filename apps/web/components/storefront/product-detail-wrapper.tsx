'use client';

import { PublicThemeWrapper, PublicThemeToggleFloating } from '@/components/booking/public-theme-wrapper';
import { ProductDetail } from './product-detail';
import type { TenantPublic, Product, TenantBranding } from '@/lib/api';

interface Props {
  tenant: TenantPublic;
  slug: string;
  product: Product;
  branding: TenantBranding | null;
  relatedProducts: Product[];
  settings: any;
}

export function ProductDetailThemeWrapper({
  tenant,
  slug,
  product,
  branding,
  relatedProducts,
  settings,
}: Props) {
  // Use same color source as PublicCatalogPage — settings first, matching the store
  const primaryColor = settings?.primaryColor || '#6366F1';
  const isCatalog = settings?.storeType !== 'ecommerce';
  const showToggle = isCatalog && (
    settings?.themeMode === 'both' || (!settings?.themeMode && settings?.enableDarkMode !== false)
  );

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={{
        primaryColor,
        secondaryColor: settings?.secondaryColor,
        accentColor: settings?.accentColor,
      }}
      enableDarkMode={settings?.enableDarkMode ?? true}
      themeMode={settings?.themeMode}
    >
      {showToggle && (
        <PublicThemeToggleFloating
          tenantSlug={slug}
          className="fixed top-4 right-4 bottom-auto h-10 w-10"
        />
      )}
      <ProductDetail
        tenant={tenant}
        slug={slug}
        product={product}
        branding={branding}
        relatedProducts={relatedProducts}
      />
    </PublicThemeWrapper>
  );
}
