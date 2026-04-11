'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Filter,
  ArrowUpDown,
  ImagePlus,
  X,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import {
  createApiClient,
  Product,
  ProductCategory,
  ProductStats,
  CreateProductData,
} from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { notifications, handleApiError } from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { useTenantConfig } from '@/contexts/tenant-config-context';

// ─── Rubro-aware labels for the catalog page ──────────────
interface CatalogLabels {
  pageTitle: string;
  pageSubtitle: string;
  newButton: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  quickCreateDesc: string;
  quickCreateNamePlaceholder: string;
  quickCreateImagePlaceholder: string;
  createButton: string;
  deleteTitle: string;
}

const DEFAULT_CATALOG_LABELS: CatalogLabels = {
  pageTitle: 'Productos',
  pageSubtitle: 'Gestioná tu catálogo de productos',
  newButton: 'Nuevo producto',
  emptyTitle: 'No tenés productos todavía',
  emptyDescription: 'Empezá a cargar tu catálogo para que tus clientes puedan ver y comprar tus productos.',
  emptyAction: 'Crear primer producto',
  quickCreateDesc: 'Agregá un producto con los datos básicos. Después podés completar el resto.',
  quickCreateNamePlaceholder: 'Ej: Remera básica',
  quickCreateImagePlaceholder: 'Subir imagen del producto',
  createButton: 'Crear producto',
  deleteTitle: 'Eliminar producto',
};

const RUBRO_CATALOG_LABELS: Record<string, Partial<CatalogLabels>> = {
  inmobiliarias: {
    pageTitle: 'Propiedades',
    pageSubtitle: 'Gestioná tu cartera de propiedades',
    newButton: 'Nueva propiedad',
    emptyTitle: 'No tenés propiedades cargadas',
    emptyDescription: 'Empezá a cargar propiedades para que tus clientes las vean en tu página.',
    emptyAction: 'Cargar primera propiedad',
    quickCreateDesc: 'Cargá una propiedad con datos básicos. Después podés completar el resto.',
    quickCreateNamePlaceholder: 'Ej: Depto 3 amb. Belgrano',
    quickCreateImagePlaceholder: 'Subir foto de la propiedad',
    createButton: 'Crear propiedad',
    deleteTitle: 'Eliminar propiedad',
  },
  // automotoras: { ... }
};

function getCatalogLabels(rubro: string): CatalogLabels {
  return { ...DEFAULT_CATALOG_LABELS, ...RUBRO_CATALOG_LABELS[rubro] };
}

// ─── Product Card (shared between sortable and static) ────
interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  getPrimaryImage: (p: Product) => string | null;
  dragHandle?: React.ReactNode;
}

function ProductCardInner({ product, onEdit, onToggleActive, onToggleFeatured, onDelete, getPrimaryImage, dragHandle }: ProductCardProps) {
  const image = getPrimaryImage(product);
  const isLowStock = product.trackInventory && product.stock <= product.lowStockThreshold;

  return (
    <Card className={`group transition-all hover:shadow-md overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          {/* Drag handle */}
          {dragHandle}

          {/* Image */}
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            {image ? (
              <NextImage src={image} alt={product.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
              </div>
            )}
            {product.isFeatured && (
              <div className="absolute top-1 left-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
              {!product.isActive && (
                <Badge variant="secondary" className="text-[10px] shrink-0">Inactivo</Badge>
              )}
            </div>
            {product.shortDescription && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate hidden md:block">{product.shortDescription}</p>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <span className="font-bold text-sm">{formatPrice(product.price, (product as any).currency || undefined)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.compareAtPrice, (product as any).currency || undefined)}</span>
              )}
              {product.category && (
                <Badge variant="outline" className="text-[10px] hidden md:inline-flex">{product.category.name}</Badge>
              )}
              {product.trackInventory && (
                <span className={`text-xs flex items-center gap-0.5 ${isLowStock ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                  {isLowStock && <AlertTriangle className="h-3 w-3" />}
                  Stock: {product.stock}
                </span>
              )}
              {product.sku && (
                <span className="text-[10px] text-muted-foreground hidden lg:inline">SKU: {product.sku}</span>
              )}
              {product.variants && product.variants.length > 0 && (
                <Badge variant="secondary" className="text-[10px] hidden md:inline-flex">
                  {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleActive}>
                  {product.isActive ? <><EyeOff className="h-4 w-4 mr-2" />Desactivar</> : <><Eye className="h-4 w-4 mr-2" />Activar</>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleFeatured}>
                  <Star className={`h-4 w-4 mr-2 ${product.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                  {product.isFeatured ? 'Quitar destacado' : 'Destacar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCard(props: Omit<ProductCardProps, 'dragHandle'>) {
  return <ProductCardInner {...props} />;
}

function SortableProductCard(props: Omit<ProductCardProps, 'dragHandle'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handle = (
    <button
      type="button"
      className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-slate-400" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className="min-w-0 overflow-hidden">
      <ProductCardInner {...props} dragHandle={handle} />
    </div>
  );
}

export default function CatalogoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { rubro } = useTenantConfig();
  const labels = getCatalogLabels(rubro);

  // ─── State ────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('order');
  const [reordering, setReordering] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick create dialog
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    image: '',
  });

  // ─── Load data ────────────────────────────────────────────
  useEffect(() => {
    if (!session?.accessToken) return;

    const api = createApiClient(session.accessToken as string);

    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, statsRes] = await Promise.all([
          api.getProducts(true),
          api.getProductCategories(),
          api.getProductStats(),
        ]);
        setProducts(productsRes);
        setCategories(categoriesRes);
        setStats(statsRes);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.accessToken]);

  // ─── Filter & Sort ────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.categoryId === filterCategory);
    }

    // Status filter
    if (filterStatus === 'active') result = result.filter((p) => p.isActive);
    if (filterStatus === 'inactive') result = result.filter((p) => !p.isActive);
    if (filterStatus === 'featured') result = result.filter((p) => p.isFeatured);
    if (filterStatus === 'low-stock')
      result = result.filter((p) => p.trackInventory && p.stock <= p.lowStockThreshold);

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        result.sort((a, b) => a.order - b.order);
    }

    return result;
  }, [products, search, filterCategory, filterStatus, sortBy]);

  // ─── Drag & Drop ─────────────────────────────────────────
  const canReorder = sortBy === 'order' && !search && filterCategory === 'all' && filterStatus === 'all';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // ── Custom accelerating auto-scroll during drag (works on mobile + desktop) ──
  const scrollStateRef = useRef({ speed: 0, raf: 0, active: false, pointerY: 0 });

  const scrollTick = useCallback(() => {
    const st = scrollStateRef.current;
    if (!st.active) return;
    const y = st.pointerY;
    if (y === 0) { st.raf = requestAnimationFrame(scrollTick); return; }
    const vh = window.innerHeight;
    const zone = vh * 0.25;
    let dir = 0;
    let intensity = 0;
    if (y < zone) {
      dir = -1;
      intensity = (zone - y) / zone;
    } else if (y > vh - zone) {
      dir = 1;
      intensity = (y - (vh - zone)) / zone;
    }
    if (dir !== 0) {
      // Reset speed instantly on direction change
      if ((dir > 0 && st.speed < 0) || (dir < 0 && st.speed > 0)) st.speed = 0;
      // Signed speed: positive = down, negative = up
      const targetSpeed = dir * Math.min(Math.abs(st.speed) + 2, 55);
      st.speed = targetSpeed;
      const px = st.speed * intensity;
      window.scrollBy({ top: px, behavior: 'instant' });
    } else {
      // Instant stop when finger leaves edge zone
      st.speed = 0;
    }
    st.raf = requestAnimationFrame(scrollTick);
  }, []);

  const handleDragStart = useCallback(() => {
    scrollStateRef.current.active = true;
    scrollStateRef.current.speed = 0;
    scrollStateRef.current.raf = requestAnimationFrame(scrollTick);
  }, [scrollTick]);

  // onDragMove is the ONLY reliable way to get pointer position during dnd-kit drag on mobile
  // activatorEvent = original pointerdown/touchstart, delta = movement since then
  const handleDragMove = useCallback((event: any) => {
    const activator = event.activatorEvent;
    const delta = event.delta;
    if (activator && delta) {
      const startY = (activator as TouchEvent).touches?.[0]?.clientY ?? (activator as MouseEvent).clientY ?? 0;
      scrollStateRef.current.pointerY = startY + (delta.y ?? 0);
    }
  }, []);

  const stopDragScroll = useCallback(() => {
    scrollStateRef.current.active = false;
    scrollStateRef.current.speed = 0;
    cancelAnimationFrame(scrollStateRef.current.raf);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    stopDragScroll();
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...products].sort((a, b) => a.order - b.order);
    const oldIndex = sorted.findIndex((p) => p.id === active.id);
    const newIndex = sorted.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex).map((p, i) => ({ ...p, order: i + 1 }));
    setProducts(reordered);

    try {
      const api = createApiClient(session?.accessToken as string);
      await api.reorderProducts(reordered.map((p) => p.id));
    } catch (error) {
      handleApiError(error);
    }
  }, [products, session?.accessToken]);

  // ─── Actions ──────────────────────────────────────────────
  const getApi = () => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  };

  const toggleActive = async (product: Product) => {
    try {
      const api = getApi();
      const updated = await api.updateProduct(product.id, { isActive: !product.isActive });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({
        title: updated.isActive ? 'Producto activado' : 'Producto desactivado',
        description: `"${product.name}" ${updated.isActive ? 'visible en tu tienda' : 'oculto de tu tienda'}.`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const api = getApi();
      const updated = await api.updateProduct(product.id, { isFeatured: !product.isFeatured });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({
        title: updated.isFeatured ? 'Producto destacado' : 'Producto sin destacar',
        description: `"${product.name}" ${updated.isFeatured ? 'aparecerá primero' : 'ya no aparece primero'}.`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const api = getApi();
      await api.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      if (stats) setStats({ ...stats, total: stats.total - 1 });
      notifications.productDeleted();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  const handleQuickCreate = async () => {
    if (!newProduct.name.trim() || !newProduct.price) return;
    setIsCreating(true);
    try {
      const api = getApi();
      const data: CreateProductData = {
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        stock: newProduct.stock ? parseInt(newProduct.stock) : undefined,
        categoryId: newProduct.categoryId || undefined,
      };
      const created = await api.createProduct(data);

      // If image was uploaded, add it
      if (newProduct.image) {
        await api.addProductImage(created.id, newProduct.image);
        const updated = await api.getProduct(created.id);
        setProducts((prev) => [updated, ...prev]);
      } else {
        setProducts((prev) => [created, ...prev]);
      }

      if (stats) setStats({ ...stats, total: stats.total + 1, active: stats.active + 1 });
      notifications.productCreated();
      setQuickCreateOpen(false);
      setNewProduct({ name: '', price: '', stock: '', categoryId: '', image: '' });

      // Navigate to full edit page for more details
      toast({
        title: `${labels.pageTitle.slice(0, -1)} creado`,
        description: 'Podés agregar más detalles editando.',
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadMedia = async (file: File) => {
    const api = getApi();
    return await api.uploadMedia(file, 'products');
  };

  // ─── Primary image helper ────────────────────────────────
  const getPrimaryImage = (product: Product): string | null => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find((img) => img.isPrimary);
    return primary?.url || product.images[0]?.url || null;
  };

  // ─── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">{labels.pageTitle}</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  {labels.pageSubtitle}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setQuickCreateOpen(true)}
                className="gap-2 border border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1 sm:flex-initial"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Creación rápida</span>
                <span className="sm:hidden">Rápido</span>
              </Button>
              <Button
                onClick={() => router.push('/catalogo/nuevo')}
                className="gap-2 bg-white text-amber-600 hover:bg-white/90 shadow-lg flex-1 sm:flex-initial"
              >
                <Plus className="h-4 w-4" />
                {labels.newButton}
              </Button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.total}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.active}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Activos</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.featured}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Destacados</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.lowStock}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Stock bajo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="featured">Destacados</option>
              <option value="low-stock">Stock bajo</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Más recientes</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="price-asc">Precio menor</option>
              <option value="price-desc">Precio mayor</option>
              <option value="stock-asc">Menor stock</option>
            </select>
          </div>

          {/* Active filters indicator */}
          {(search || filterCategory !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>
                {filteredProducts.length} de {products.length} productos
              </span>
              <button
                onClick={() => {
                  setSearch('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                }}
                className="text-amber-600 hover:text-amber-700 underline ml-2"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Product List ────────────────────────────────── */}
      {products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={labels.emptyTitle}
          description={labels.emptyDescription}
          action={{
            label: labels.emptyAction,
            onClick: () => router.push('/catalogo/nuevo'),
          }}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron productos con los filtros aplicados."
          action={{
            label: 'Limpiar filtros',
            onClick: () => {
              setSearch('');
              setFilterCategory('all');
              setFilterStatus('all');
            },
          }}
        />
      ) : canReorder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragCancel={stopDragScroll}>
          <SortableContext items={filteredProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {filteredProducts.map((product) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => router.push(`/catalogo/${product.id}`)}
                  onToggleActive={() => toggleActive(product)}
                  onToggleFeatured={() => toggleFeatured(product)}
                  onDelete={() => { setProductToDelete(product); setDeleteOpen(true); }}
                  getPrimaryImage={getPrimaryImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => router.push(`/catalogo/${product.id}`)}
              onToggleActive={() => toggleActive(product)}
              onToggleFeatured={() => toggleFeatured(product)}
              onDelete={() => { setProductToDelete(product); setDeleteOpen(true); }}
              getPrimaryImage={getPrimaryImage}
            />
          ))}
        </div>
      )}

      {/* ─── Delete Dialog ───────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.deleteTitle}</DialogTitle>
            <DialogDescription>
              {productToDelete
                ? `¿Estás seguro de que querés eliminar "${productToDelete.name}"? Esta acción no se puede deshacer.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Quick Create Dialog ─────────────────────────── */}
      <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creación rápida</DialogTitle>
            <DialogDescription>
              {labels.quickCreateDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="qc-name">Nombre *</Label>
              <Input
                id="qc-name"
                placeholder={labels.quickCreateNamePlaceholder}
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qc-price">Precio *</Label>
                <Input
                  id="qc-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="qc-stock">Stock</Label>
                <Input
                  id="qc-stock"
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <Label htmlFor="qc-category">Categoría</Label>
                <select
                  id="qc-category"
                  value={newProduct.categoryId}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
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
            )}

            <div>
              <Label>Imagen</Label>
              <ImageUpload
                value={newProduct.image}
                onChange={(url) =>
                  setNewProduct((prev) => ({ ...prev, image: url }))
                }
                onUpload={handleUploadMedia}
                aspectRatio="video"
                placeholder={labels.quickCreateImagePlaceholder}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setQuickCreateOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQuickCreate}
              disabled={isCreating || !newProduct.name.trim() || !newProduct.price}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                labels.createButton
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
