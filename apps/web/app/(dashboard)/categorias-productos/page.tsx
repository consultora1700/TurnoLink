'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  MoreVertical,
  Package,
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
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { createApiClient, ProductCategory } from '@/lib/api';
import { notifications, handleApiError } from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

export default function CategoriasProductosPage() {
  const { data: session } = useSession();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getApi = () => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  };

  // ─── Load ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.accessToken) return;

    const api = createApiClient(session.accessToken as string);
    api
      .getProductCategories()
      .then(setCategories)
      .catch(handleApiError)
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  // ─── Open form ────────────────────────────────────────────
  const openForm = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
    }
    setFormOpen(true);
  };

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    try {
      const api = getApi();
      if (editingCategory) {
        const updated = await api.updateProductCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          image: formData.image || undefined,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        );
        notifications.saved();
      } else {
        const created = await api.createProductCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          image: formData.image || undefined,
        });
        setCategories((prev) => [...prev, created]);
        notifications.categoryCreated();
      }
      setFormOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const api = getApi();
      await api.deleteProductCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      notifications.categoryDeleted();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleUploadMedia = async (file: File) => {
    const api = getApi();
    return await api.uploadMedia(file, 'categories');
  };

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

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Categorías de productos</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Organizá tu catálogo en categorías
              </p>
            </div>
          </div>

          <Button
            onClick={() => openForm()}
            className="bg-white text-amber-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva categoría
          </Button>
        </div>
      </div>

      {/* ─── List ────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin categorías"
          description="Creá categorías para organizar tus productos. Ej: Ropa, Accesorios, Electrónica."
          action={{ label: 'Crear primera categoría', onClick: () => openForm() }}
        />
      ) : (
        <div className="grid gap-3">
          {categories
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <Card key={category.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image or icon */}
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Tag className="h-5 w-5 text-amber-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      {category.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Product count */}
                    {category._count && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        <Package className="h-3 w-3 mr-1" />
                        {category._count.products}
                      </Badge>
                    )}

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openForm(category)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* ─── Form Dialog ─────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
            <DialogDescription>
              Las categorías ayudan a tus clientes a encontrar productos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                placeholder="Ej: Ropa"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="cat-desc">Descripción</Label>
              <Input
                id="cat-desc"
                placeholder="Breve descripción"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Imagen</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                onUpload={handleUploadMedia}
                aspectRatio="video"
                placeholder="Imagen de la categoría"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editingCategory ? (
                'Guardar cambios'
              ) : (
                'Crear categoría'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Dialog ───────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              {categoryToDelete
                ? `¿Estás seguro de que querés eliminar "${categoryToDelete.name}"? Los productos de esta categoría quedarán sin categoría.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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
    </div>
  );
}
