'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Product, ProductAttribute } from '@/lib/api';
import { inferPropertyAttrs } from '@/lib/property-utils';

export type OperationType = 'Venta' | 'Alquiler' | 'Alquiler temporario' | 'Desarrollo' | 'todos';
export type SortOption = 'reciente' | 'precio-asc' | 'precio-desc' | 'superficie';

interface PropertyFilters {
  operacion: OperationType;
  barrio: string;
  tipoPropiedad: string;
  ambientes: string;
  dormitorios: string;
  precioMin: number | null;
  precioMax: number | null;
  aptoCredito: boolean;
  search: string;
  sort: SortOption;
}

const defaultFilters: PropertyFilters = {
  operacion: 'todos',
  barrio: '',
  tipoPropiedad: '',
  ambientes: '',
  dormitorios: '',
  precioMin: null,
  precioMax: null,
  aptoCredito: false,
  search: '',
  sort: 'reciente',
};

function getAttr(product: Product, key: string): string | undefined {
  const attrs = product.attributes as ProductAttribute[] | null;
  const direct = attrs?.find(a => a.key === key)?.value;
  if (direct) return direct;

  // Fallback: infer from product name when attributes are missing
  if (key === 'operacion' || key === 'tipo_propiedad' || key === 'barrio') {
    const inferred = inferPropertyAttrs(product.name, attrs);
    if (key === 'operacion') return inferred.operacion;
    if (key === 'tipo_propiedad') return inferred.tipoPropiedad;
    if (key === 'barrio') return inferred.barrio;
  }
  return undefined;
}

export function usePropertyFilters(products: Product[]) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);

  const activeProducts = useMemo(() => products.filter(p => p.isActive), [products]);

  // Extract available filter options from products (cascading)
  const filterOptions = useMemo(() => {
    const barrios = new Set<string>();
    const tipos = new Set<string>();
    const ambientesSet = new Set<string>();

    for (const p of activeProducts) {
      const barrio = getAttr(p, 'barrio');
      if (barrio) barrios.add(barrio);
      const tipo = getAttr(p, 'tipo_propiedad');
      if (tipo) tipos.add(tipo);
      const amb = getAttr(p, 'ambientes');
      if (amb) ambientesSet.add(amb);
    }

    return {
      barrios: Array.from(barrios).sort(),
      tipos: Array.from(tipos).sort(),
      ambientes: Array.from(ambientesSet).sort((a, b) => Number(a) - Number(b)),
    };
  }, [activeProducts]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let result = activeProducts;

    // Operation type
    if (filters.operacion !== 'todos') {
      result = result.filter(p => {
        const op = getAttr(p, 'operacion');
        if (!op) return true;
        if (filters.operacion === 'Alquiler temporario') return op === 'Alquiler temporario';
        if (filters.operacion === 'Desarrollo') return op === 'Desarrollo' || op === 'Emprendimiento';
        // "Venta y Alquiler" matches both
        return op === filters.operacion || op === 'Venta y Alquiler';
      });
    }

    // Barrio
    if (filters.barrio) {
      result = result.filter(p => getAttr(p, 'barrio') === filters.barrio);
    }

    // Tipo propiedad
    if (filters.tipoPropiedad) {
      result = result.filter(p => getAttr(p, 'tipo_propiedad') === filters.tipoPropiedad);
    }

    // Ambientes
    if (filters.ambientes) {
      result = result.filter(p => {
        const amb = getAttr(p, 'ambientes');
        if (filters.ambientes === '5+') return amb ? Number(amb) >= 5 : false;
        return amb === filters.ambientes;
      });
    }

    // Dormitorios
    if (filters.dormitorios) {
      result = result.filter(p => {
        const dorm = getAttr(p, 'dormitorios');
        if (filters.dormitorios === '5+') return dorm ? Number(dorm) >= 5 : false;
        return dorm === filters.dormitorios;
      });
    }

    // Price range
    if (filters.precioMin !== null) {
      result = result.filter(p => Number(p.price) >= filters.precioMin!);
    }
    if (filters.precioMax !== null) {
      result = result.filter(p => Number(p.price) <= filters.precioMax!);
    }

    // Apto crédito
    if (filters.aptoCredito) {
      result = result.filter(p => {
        const val = getAttr(p, 'apto_credito');
        return val === 'true' || val === 'Sí' || val === 'si' || val === '1';
      });
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (getAttr(p, 'barrio') || '').toLowerCase().includes(q)
      );
    }

    // Sort
    switch (filters.sort) {
      case 'precio-asc':
        result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'precio-desc':
        result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'superficie':
        result = [...result].sort((a, b) => {
          const m2a = Number(getAttr(a, 'm2_totales') || 0);
          const m2b = Number(getAttr(b, 'm2_totales') || 0);
          return m2b - m2a;
        });
        break;
      case 'reciente':
      default:
        result = [...result].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [activeProducts, filters]);

  const updateFilter = useCallback(<K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K],
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.operacion !== 'todos') count++;
    if (filters.barrio) count++;
    if (filters.tipoPropiedad) count++;
    if (filters.ambientes) count++;
    if (filters.dormitorios) count++;
    if (filters.precioMin !== null || filters.precioMax !== null) count++;
    if (filters.aptoCredito) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filterOptions,
    filteredProducts,
    updateFilter,
    clearFilters,
    activeFilterCount,
    totalCount: activeProducts.length,
  };
}
