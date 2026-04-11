'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Star,
  Pencil,
  GripVertical,
  Package,
  X,
  ImagePlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  createApiClient,
  Product,
  ProductCategory,
  ProductImage,
  ProductVariant,
  CreateProductData,
  CreateProductVariantData,
} from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { notifications, handleApiError } from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { useTenantConfig } from '@/contexts/tenant-config-context';
import { getRubroAttributes, hasRubroAttributes, type AttributeDefinition } from '@/lib/rubro-attributes';
import type { ProductAttribute } from '@/lib/api';

// ─── Rubro-specific product form configuration ─────────────────
// Scalable: add a new key for each rubro that needs custom behavior.
// Rubros not listed here fall back to DEFAULT_PRODUCT_CONFIG.
interface RubroProductConfig {
  namePlaceholder: string;
  shortDescPlaceholder: string;
  descriptionPlaceholder: string;
  defaultTrackInventory: boolean;
  showVariants: boolean;
  showType: boolean;
  skuPlaceholder: string;
  itemLabel: string;            // "producto" / "propiedad" / "vehículo"
  itemLabelPlural: string;      // "productos" / "propiedades" / "vehículos"
}

const DEFAULT_PRODUCT_CONFIG: RubroProductConfig = {
  namePlaceholder: 'Ej: Remera de algodón',
  shortDescPlaceholder: 'Una línea que resuma el producto',
  descriptionPlaceholder: 'Detalles, materiales, medidas, etc.',
  defaultTrackInventory: true,
  showVariants: true,
  showType: true,
  skuPlaceholder: 'Código interno',
  itemLabel: 'producto',
  itemLabelPlural: 'productos',
};

const RUBRO_PRODUCT_CONFIG: Record<string, Partial<RubroProductConfig>> = {
  inmobiliarias: {
    namePlaceholder: 'Ej: Depto 3 amb. en Belgrano',
    shortDescPlaceholder: 'Ej: Luminoso, con balcón, vista abierta',
    descriptionPlaceholder: 'Ambientes, m², amenities, ubicación, estado...',
    defaultTrackInventory: false,
    showVariants: false,
    showType: false,
    skuPlaceholder: 'Código de propiedad',
    itemLabel: 'propiedad',
    itemLabelPlural: 'propiedades',
  },
  'mercado-indumentaria': {
    namePlaceholder: 'Ej: Remera oversize algodón',
    shortDescPlaceholder: 'Ej: Estampada, manga corta, unisex',
    descriptionPlaceholder: 'Material, composición, cuidados, medidas...',
    skuPlaceholder: 'Código interno',
  },
  'mercado-calzado': {
    namePlaceholder: 'Ej: Zapatillas Nike Air Max 90',
    shortDescPlaceholder: 'Ej: Blancas, talle 42, nuevas en caja',
    descriptionPlaceholder: 'Material, suela, plantilla, origen...',
    skuPlaceholder: 'Código / SKU',
  },
  'mercado-celulares': {
    namePlaceholder: 'Ej: iPhone 15 Pro Max 256GB',
    shortDescPlaceholder: 'Ej: Titanio natural, batería 100%, libre',
    descriptionPlaceholder: 'Estado, accesorios incluidos, garantía...',
    defaultTrackInventory: false,
    showVariants: false,
    skuPlaceholder: 'IMEI / Código',
    itemLabel: 'equipo',
    itemLabelPlural: 'equipos',
  },
  'mercado-computacion': {
    namePlaceholder: 'Ej: MacBook Air M3 16GB 512GB',
    shortDescPlaceholder: 'Ej: Nueva, sellada, garantía oficial',
    descriptionPlaceholder: 'Procesador, RAM, almacenamiento, pantalla, puertos...',
    defaultTrackInventory: false,
    showVariants: false,
    skuPlaceholder: 'Nro. serie / Código',
    itemLabel: 'equipo',
    itemLabelPlural: 'equipos',
  },
  'mercado-electronica': {
    namePlaceholder: 'Ej: Smart TV Samsung 55" 4K',
    shortDescPlaceholder: 'Ej: Modelo 2025, HDR10+, con garantía',
    descriptionPlaceholder: 'Resolución, conectividad, potencia, dimensiones...',
    skuPlaceholder: 'Modelo / Código',
  },
  'mercado-accesorios-tech': {
    namePlaceholder: 'Ej: AirPods Pro 2da gen',
    shortDescPlaceholder: 'Ej: Bluetooth 5.3, cancelación de ruido',
    descriptionPlaceholder: 'Compatibilidad, conectividad, autonomía...',
    skuPlaceholder: 'Código / SKU',
  },
  'mercado-automotoras': {
    namePlaceholder: 'Ej: Toyota Corolla XEi 2024',
    shortDescPlaceholder: 'Ej: Automático, 20.000 km, único dueño',
    descriptionPlaceholder: 'Motor, transmisión, equipamiento, estado, service...',
    defaultTrackInventory: false,
    showVariants: false,
    showType: false,
    skuPlaceholder: 'Patente / Código',
    itemLabel: 'vehículo',
    itemLabelPlural: 'vehículos',
  },
  'mercado-alimentos': {
    namePlaceholder: 'Ej: Alfajor artesanal chocolate',
    shortDescPlaceholder: 'Ej: Caja x12, sin TACC',
    descriptionPlaceholder: 'Ingredientes, peso, vencimiento, conservación...',
    skuPlaceholder: 'Código de barras / SKU',
  },
  'mercado-muebles': {
    namePlaceholder: 'Ej: Escritorio nórdico 120x60',
    shortDescPlaceholder: 'Ej: Madera paraíso, patas metálicas',
    descriptionPlaceholder: 'Dimensiones, material, peso máximo, armado...',
    skuPlaceholder: 'Código interno',
  },
  'mercado-cosmetica': {
    namePlaceholder: 'Ej: Sérum vitamina C 30ml',
    shortDescPlaceholder: 'Ej: Iluminador, antioxidante, vegano',
    descriptionPlaceholder: 'Ingredientes, modo de uso, tipo de piel...',
    skuPlaceholder: 'Código / Lote',
  },
  'mercado-mascotas': {
    namePlaceholder: 'Ej: Royal Canin Medium Adult 15kg',
    shortDescPlaceholder: 'Ej: Perros medianos, +12 meses',
    descriptionPlaceholder: 'Composición, raza recomendada, indicaciones...',
    skuPlaceholder: 'Código / SKU',
  },
  'mercado-joyeria': {
    namePlaceholder: 'Ej: Anillo plata 925 circonio',
    shortDescPlaceholder: 'Ej: Ajustable, con estuche',
    descriptionPlaceholder: 'Material, peso, piedras, garantía...',
    defaultTrackInventory: false,
    skuPlaceholder: 'Código interno',
  },
  'mercado-ferreteria': {
    namePlaceholder: 'Ej: Taladro Bosch 13mm 750W',
    shortDescPlaceholder: 'Ej: Percutor, mandril, maletín incluido',
    descriptionPlaceholder: 'Potencia, velocidad, accesorios, garantía...',
    skuPlaceholder: 'Código / SKU',
  },
  gastronomia: {
    namePlaceholder: 'Ej: Milanesa napolitana con papas',
    shortDescPlaceholder: 'Ej: Con muzza, jamón y salsa fileto',
    descriptionPlaceholder: 'Ingredientes, acompañamientos, opciones sin TACC...',
    defaultTrackInventory: false,
    showVariants: false,
    showType: false,
    skuPlaceholder: 'Código interno',
    itemLabel: 'plato',
    itemLabelPlural: 'platos',
  },
};

function getRubroConfig(rubro: string): RubroProductConfig {
  return { ...DEFAULT_PRODUCT_CONFIG, ...RUBRO_PRODUCT_CONFIG[rubro] };
}

/** Currency symbol for the price input prefix */
const CURRENCY_SYMBOLS: Record<string, string> = {
  '': '$',       // default = ARS
  ARS: '$',
  USD: 'US$',
  EUR: '€',
  BRL: 'R$',
};

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isEditing = !!productId;
  const { rubro } = useTenantConfig();
  const cfg = getRubroConfig(rubro);

  // ─── State ────────────────────────────────────────────────
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceDelivery, setPriceDelivery] = useState('');
  const [priceTakeaway, setPriceTakeaway] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [trackInventory, setTrackInventory] = useState(cfg.defaultTrackInventory);
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [type, setType] = useState('PHYSICAL');
  const [currency, setCurrency] = useState('');

  // Ficha técnica (attributes)
  const rubroAttrs = getRubroAttributes(rubro);
  const showFicha = rubroAttrs.length > 0;
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const setAttr = (key: string, value: string) => setAttributes((prev) => ({ ...prev, [key]: value }));
  const toggleMultiselect = (key: string, option: string) => {
    const current = (attributes[key] || '').split(',').filter(Boolean);
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setAttr(key, next.join(','));
  };

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    name: '',
    value: '',
    sku: '',
    price: '',
    stock: '',
  });

  // ─── API helper ───────────────────────────────────────────
  const getApi = useCallback(() => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  // ─── Load data ────────────────────────────────────────────
  useEffect(() => {
    if (!session?.accessToken) return;

    const api = createApiClient(session.accessToken as string);

    const load = async () => {
      try {
        const [categoriesRes] = await Promise.all([api.getProductCategories()]);
        setCategories(categoriesRes);

        if (productId) {
          const p = await api.getProduct(productId);
          setProduct(p);
          setName(p.name);
          setDescription(p.description || '');
          setShortDescription(p.shortDescription || '');
          setPrice(String(p.price));
          setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '');
          setCostPrice(p.costPrice ? String(p.costPrice) : '');
          setPriceDelivery((p as any).priceDelivery ? String((p as any).priceDelivery) : '');
          setPriceTakeaway((p as any).priceTakeaway ? String((p as any).priceTakeaway) : '');
          setSku(p.sku || '');
          setStock(String(p.stock));
          setLowStockThreshold(String(p.lowStockThreshold));
          setTrackInventory(p.trackInventory);
          setCategoryId(p.categoryId || '');
          setIsActive(p.isActive);
          setIsFeatured(p.isFeatured);
          setType(p.type || 'PHYSICAL');
          setCurrency((p as any).currency || '');
          // Load ficha técnica attributes
          if (p.attributes && Array.isArray(p.attributes)) {
            const attrMap: Record<string, string> = {};
            (p.attributes as ProductAttribute[]).forEach((a) => { attrMap[a.key] = a.value; });
            setAttributes(attrMap);
          }
          setImages(p.images || []);
          setVariants(p.variants || []);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.accessToken, productId]);

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Nombre requerido', description: `Ingresá un nombre para ${cfg.itemLabel === 'producto' ? 'el' : 'la'} ${cfg.itemLabel}.`, variant: 'destructive' });
      return;
    }
    if (!price || parseFloat(price) < 0) {
      toast({ title: 'Precio inválido', description: 'Ingresá un precio válido.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const api = getApi();
      const data: CreateProductData = {
        name: name.trim(),
        description: description.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        priceDelivery: priceDelivery ? parseFloat(priceDelivery) : undefined,
        priceTakeaway: priceTakeaway ? parseFloat(priceTakeaway) : undefined,
        sku: sku.trim() || undefined,
        stock: stock ? parseInt(stock) : 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        trackInventory,
        categoryId: categoryId || undefined,
        isActive,
        isFeatured,
        type,
        currency: currency || undefined,
      } as any;

      // Ficha técnica: convert attribute map → array
      if (rubroAttrs.length > 0) {
        const attrArray = rubroAttrs
          .filter((def) => attributes[def.key]?.trim())
          .map((def) => ({
            key: def.key,
            label: def.label,
            value: attributes[def.key].trim(),
            type: def.type,
            ...(def.unit ? { unit: def.unit } : {}),
          }));
        if (attrArray.length > 0) data.attributes = attrArray;
      }

      if (isEditing && productId) {
        await api.updateProduct(productId, data);
        notifications.productUpdated();
      } else {
        const created = await api.createProduct(data);
        notifications.productCreated();
        // Redirect to edit page to add images/variants
        router.push(`/catalogo/${created.id}`);
        return;
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  // ─── Image handlers ───────────────────────────────────────
  const handleUploadMedia = async (file: File) => {
    const api = getApi();
    return await api.uploadMedia(file, 'products');
  };

  const handleAddImage = async (url: string) => {
    if (!productId) return;
    setUploadingImage(true);
    try {
      const api = getApi();
      const updated = await api.addProductImage(productId, url);
      setImages(updated.images || []);
      toast({ title: 'Imagen agregada' });
    } catch (error) {
      handleApiError(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!productId) return;
    try {
      const api = getApi();
      const updated = await api.deleteProductImage(productId, imageId);
      setImages(updated.images || []);
      toast({ title: 'Imagen eliminada' });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!productId) return;
    try {
      const api = getApi();
      const updated = await api.setPrimaryProductImage(productId, imageId);
      setImages(updated.images || []);
      toast({ title: 'Imagen principal actualizada' });
    } catch (error) {
      handleApiError(error);
    }
  };

  // ─── Variant handlers ─────────────────────────────────────
  const openVariantDialog = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        name: variant.name,
        value: variant.value,
        sku: variant.sku || '',
        price: variant.price ? String(variant.price) : '',
        stock: String(variant.stock),
      });
    } else {
      setEditingVariant(null);
      setVariantForm({ name: '', value: '', sku: '', price: '', stock: '0' });
    }
    setVariantDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!productId || !variantForm.name.trim() || !variantForm.value.trim()) return;

    try {
      const api = getApi();
      const data: CreateProductVariantData = {
        name: variantForm.name.trim(),
        value: variantForm.value.trim(),
        sku: variantForm.sku.trim() || undefined,
        price: variantForm.price ? parseFloat(variantForm.price) : undefined,
        stock: parseInt(variantForm.stock) || 0,
      };

      if (editingVariant) {
        const updated = await api.updateProductVariant(productId, editingVariant.id, data);
        setVariants((prev) => prev.map((v) => (v.id === editingVariant.id ? updated : v)));
        toast({ title: 'Variante actualizada' });
      } else {
        const created = await api.createProductVariant(productId, data);
        setVariants((prev) => [...prev, created]);
        toast({ title: 'Variante creada' });
      }
      setVariantDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!productId) return;
    try {
      const api = getApi();
      await api.deleteProductVariant(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast({ title: 'Variante eliminada' });
    } catch (error) {
      handleApiError(error);
    }
  };

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/catalogo')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Editar ${cfg.itemLabel}` : `Nueva ${cfg.itemLabel}`}
          </h1>
          {isEditing && product && (
            <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !price}
          className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Main Column ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={cfg.namePlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="shortDesc">Descripción corta</Label>
                <Input
                  id="shortDesc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder={cfg.shortDescPlaceholder}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción completa</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={cfg.descriptionPlaceholder}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(() => {
                  const sym = CURRENCY_SYMBOLS[currency] || '$';
                  const pl = sym.length > 1 ? 'pl-10' : 'pl-7';
                  return (
                    <>
                      <div>
                        <Label htmlFor="price">Precio de venta *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {sym}
                          </span>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={pl}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="comparePrice">Precio anterior</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {sym}
                          </span>
                          <Input
                            id="comparePrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={compareAtPrice}
                            onChange={(e) => setCompareAtPrice(e.target.value)}
                            className={pl}
                            placeholder="Tachado"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Se muestra tachado si es mayor al precio de venta
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="costPrice">Costo</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {sym}
                          </span>
                          <Input
                            id="costPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={costPrice}
                            onChange={(e) => setCostPrice(e.target.value)}
                            className={pl}
                            placeholder="Para tu control"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          No visible para clientes
                        </p>
                      </div>

                      {/* Precios diferenciados — solo gastronomía */}
                      {rubro === 'gastronomia' && (
                        <>
                          <div>
                            <Label htmlFor="priceDelivery">Precio delivery</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                {sym}
                              </span>
                              <Input
                                id="priceDelivery"
                                type="number"
                                min="0"
                                step="0.01"
                                value={priceDelivery}
                                onChange={(e) => setPriceDelivery(e.target.value)}
                                className={pl}
                                placeholder="Igual al precio base"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Dejá vacío para usar el precio de venta
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="priceTakeaway">Precio para llevar</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                {sym}
                              </span>
                              <Input
                                id="priceTakeaway"
                                type="number"
                                min="0"
                                step="0.01"
                                value={priceTakeaway}
                                onChange={(e) => setPriceTakeaway(e.target.value)}
                                className={pl}
                                placeholder="Igual al precio base"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Dejá vacío para usar el precio de venta
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Currency selector */}
              <div className="mt-4">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Predeterminada del negocio (ARS)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="ARS">ARS (Pesos argentinos)</option>
                  <option value="EUR">EUR (Euros)</option>
                  <option value="BRL">BRL (Reales)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Dejá en blanco para usar la moneda del negocio. Cambiá a USD para propiedades tasadas en dólares.
                </p>
              </div>

              {/* Margin indicator */}
              {price && costPrice && parseFloat(price) > 0 && parseFloat(costPrice) > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                  Margen:{' '}
                  <span className="font-semibold text-emerald-600">
                    {Math.round(
                      ((parseFloat(price) - parseFloat(costPrice)) / parseFloat(price)) * 100
                    )}
                    %
                  </span>{' '}
                  ({formatPrice(parseFloat(price) - parseFloat(costPrice))} por unidad)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ficha Técnica (rubro-specific attributes) */}
          {showFicha && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ficha Técnica</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Group attributes
                  const groups: Record<string, AttributeDefinition[]> = {};
                  for (const def of rubroAttrs) {
                    const g = def.group || '_general';
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(def);
                  }
                  const groupEntries = Object.entries(groups);

                  return (
                    <div className="space-y-5">
                      {groupEntries.map(([groupName, defs]) => (
                        <div key={groupName}>
                          {groupName !== '_general' && (
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{groupName}</p>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {defs.map((def) => (
                              <div key={def.key} className={def.type === 'multiselect' || def.type === 'textarea' ? 'col-span-2 sm:col-span-3' : ''}>
                                <Label htmlFor={`attr-${def.key}`} className="text-xs">{def.label}</Label>

                                {def.type === 'text' && (
                                  <Input
                                    id={`attr-${def.key}`}
                                    value={attributes[def.key] || ''}
                                    onChange={(e) => setAttr(def.key, e.target.value)}
                                    placeholder={def.placeholder || ''}
                                    className="h-8 text-sm"
                                  />
                                )}

                                {def.type === 'textarea' && (
                                  <textarea
                                    id={`attr-${def.key}`}
                                    value={attributes[def.key] || ''}
                                    onChange={(e) => setAttr(def.key, e.target.value)}
                                    placeholder={def.placeholder || ''}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                                  />
                                )}

                                {def.type === 'number' && (
                                  <div className="relative">
                                    <Input
                                      id={`attr-${def.key}`}
                                      type="number"
                                      min="0"
                                      value={attributes[def.key] || ''}
                                      onChange={(e) => setAttr(def.key, e.target.value)}
                                      className={`h-8 text-sm ${def.unit ? 'pr-12' : ''}`}
                                    />
                                    {def.unit && (
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        {def.unit}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {def.type === 'select' && (
                                  <select
                                    id={`attr-${def.key}`}
                                    value={attributes[def.key] || ''}
                                    onChange={(e) => setAttr(def.key, e.target.value)}
                                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                                  >
                                    <option value="">—</option>
                                    {def.options?.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                )}

                                {def.type === 'boolean' && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={attributes[def.key] === 'true'}
                                      onClick={() => setAttr(def.key, attributes[def.key] === 'true' ? 'false' : 'true')}
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                        attributes[def.key] === 'true' ? 'bg-emerald-500' : 'bg-slate-200'
                                      }`}
                                    >
                                      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
                                        attributes[def.key] === 'true' ? 'translate-x-4' : 'translate-x-0'
                                      }`} />
                                    </button>
                                    <span className="text-xs text-muted-foreground">
                                      {attributes[def.key] === 'true' ? 'Sí' : 'No'}
                                    </span>
                                  </div>
                                )}

                                {def.type === 'multiselect' && (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {def.options?.map((opt) => {
                                      const selected = (attributes[def.key] || '').split(',').includes(opt);
                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => toggleMultiselect(def.key, opt)}
                                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                            selected
                                              ? 'bg-amber-500 text-white border-amber-500'
                                              : 'bg-background text-muted-foreground border-input hover:border-foreground/30'
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Images (only when editing) */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Imágenes ({images.length}/10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Existing images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {images
                      .sort((a, b) => a.order - b.order)
                      .map((img) => (
                        <div key={img.id} className="relative group rounded-lg overflow-hidden bg-slate-100">
                          <div className="aspect-square relative">
                            <NextImage
                              src={img.url}
                              alt={img.alt || ''}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          </div>
                          {/* Primary badge */}
                          {img.isPrimary && (
                            <div className="absolute top-1.5 left-1.5">
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                                Principal
                              </Badge>
                            </div>
                          )}
                          {/* Actions overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {!img.isPrimary && (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => handleSetPrimary(img.id)}
                                title="Hacer principal"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDeleteImage(img.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Upload new image */}
                {images.length < 10 && (
                  <ImageUpload
                    value=""
                    onChange={(url) => {
                      if (url) handleAddImage(url);
                    }}
                    onUpload={handleUploadMedia}
                    aspectRatio="video"
                    placeholder="Agregar imagen"
                    disabled={uploadingImage}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Variants (only when editing + rubro supports them) */}
          {isEditing && cfg.showVariants && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Variantes</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openVariantDialog()}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent>
                {variants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin variantes. Ej: Talle S, Color Rojo, etc.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{v.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {v.value}
                            </Badge>
                            {!v.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactiva
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {v.price !== null && <span>{formatPrice(v.price)}</span>}
                            <span>Stock: {v.stock}</span>
                            {v.sku && <span>SKU: {v.sku}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openVariantDialog(v)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteVariant(v.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Sidebar Column ────────────────────────────── */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Activo</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    isActive ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isActive ? 'Visible en tu tienda' : 'Oculto de tu tienda'}
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Destacado</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFeatured}
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    isFeatured ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      isFeatured ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isFeatured
                  ? 'Aparece primero en tu catálogo'
                  : 'Orden normal en tu catálogo'}
              </p>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {cfg.showType && (
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="PHYSICAL">Físico</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="SERVICE">Servicio</option>
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder={cfg.skuPlaceholder}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="trackInventory">Controlar stock</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={trackInventory}
                  onClick={() => setTrackInventory(!trackInventory)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    trackInventory ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      trackInventory ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {trackInventory && (
                <>
                  <div>
                    <Label htmlFor="stock">Stock actual</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lowStock">Alerta stock bajo</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Te avisamos cuando queden menos unidades
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save button (bottom of sidebar on mobile) */}
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !price}
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white lg:hidden"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : `Guardar ${cfg.itemLabel}`}
          </Button>
        </div>
      </div>

      {/* ─── Variant Dialog ──────────────────────────────── */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Editar variante' : 'Nueva variante'}
            </DialogTitle>
            <DialogDescription>
              Ej: Talle → S, Color → Rojo, Material → Algodón
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Input
                  placeholder="Ej: Talle"
                  value={variantForm.name}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Valor *</Label>
                <Input
                  placeholder="Ej: S"
                  value={variantForm.value}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Precio</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Base"
                  value={variantForm.price}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={variantForm.stock}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>SKU</Label>
                <Input
                  placeholder="Opcional"
                  value={variantForm.sku}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, sku: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveVariant}
              disabled={!variantForm.name.trim() || !variantForm.value.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {editingVariant ? 'Guardar cambios' : 'Agregar variante'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
