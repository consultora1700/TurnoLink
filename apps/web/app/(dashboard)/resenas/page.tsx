'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Star,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  MessageSquare,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  Clock,
  CheckCircle2,
  X,
  Flag,
  Reply,
  Trash2,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { bookingGender } from '@/lib/tenant-config';
import { isGastronomiaRubro } from '@/lib/rubro-attributes';
import { createApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { UtensilsCrossed, MapPin } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  ownerResponse: string | null;
  ownerRespondedAt: string | null;
  flaggedByOwner: boolean;
  flagReason: string | null;
  customer: {
    name: string;
    email: string;
  };
  booking: {
    service: {
      name: string;
    };
  };
}

interface GastroReview {
  id: string;
  tableNumber: number;
  review: string;
  totalAmount: number;
  tipAmount: number;
  openedAt: string;
  closedAt: string | null;
  updatedAt: string;
}

interface Stats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
  recentBookingsCount: number;
  recentBookingsText: string;
}

interface HideQuota {
  total: number;
  hidden: number;
  maxHideable: number;
  remaining: number;
}

const FLAG_REASONS: Record<string, string> = {
  spam: 'Spam',
  fake: 'Resena falsa',
  inappropriate: 'Contenido inapropiado',
  other: 'Otro',
};

const ITEMS_PER_PAGE = 10;

export default function ResenasPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { clientLabelPlural, rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);
  const isGastro = isGastronomiaRubro(rubro);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hideQuota, setHideQuota] = useState<HideQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Gastro reviews
  const [gastroReviews, setGastroReviews] = useState<GastroReview[]>([]);
  const [gastroLoading, setGastroLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gastro' | 'booking'>('gastro');
  const [gastroSearchQuery, setGastroSearchQuery] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Response state
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  // Flag state
  const [flagDialogId, setFlagDialogId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [savingFlag, setSavingFlag] = useState(false);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${session?.accessToken}`,
    'Content-Type': 'application/json',
  }), [session?.accessToken]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const promises: Promise<any>[] = [
          fetch(`${API_URL}/api/reviews`, { headers: authHeaders }),
          fetch(`${API_URL}/api/reviews/stats`, { headers: authHeaders }),
          fetch(`${API_URL}/api/reviews/hide-quota`, { headers: authHeaders }),
        ];

        // Fetch gastro reviews for gastro tenants
        if (isGastro) {
          promises.push(
            fetch(`${API_URL}/api/gastro/dashboard/reviews`, { headers: authHeaders })
          );
        }

        const results = await Promise.all(promises);

        if (results[0].ok) setReviews(await results[0].json());
        if (results[1].ok) setStats(await results[1].json());
        if (results[2].ok) setHideQuota(await results[2].json());
        if (isGastro && results[3]?.ok) setGastroReviews(await results[3].json());
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken, authHeaders, isGastro]);

  // ============ Actions ============

  const toggleVisibility = async (reviewId: string, isVisible: boolean) => {
    if (!session?.accessToken) return;
    setUpdatingId(reviewId);

    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/visibility`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isVisible } : r))
        );
        // Refresh quota
        const quotaRes = await fetch(`${API_URL}/api/reviews/hide-quota`, { headers: authHeaders });
        if (quotaRes.ok) setHideQuota(await quotaRes.json());

        toast({
          title: isVisible ? 'Resena visible' : 'Resena oculta',
          description: isVisible
            ? 'La resena ahora se muestra en tu pagina publica'
            : 'La resena ya no se muestra en tu pagina publica',
        });
      } else {
        const err = await response.json().catch(() => null);
        toast({
          title: 'No se pudo ocultar',
          description: err?.message || 'Superaste el limite de resenas ocultas',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la resena',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const saveResponse = async (reviewId: string) => {
    if (!session?.accessToken) return;
    setSavingResponse(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/response`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ response: responseText.trim() || null }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, ownerResponse: updated.ownerResponse, ownerRespondedAt: updated.ownerRespondedAt }
              : r
          )
        );
        setRespondingId(null);
        setResponseText('');
        toast({ title: 'Respuesta guardada' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la respuesta', variant: 'destructive' });
    } finally {
      setSavingResponse(false);
    }
  };

  const deleteResponse = async (reviewId: string) => {
    if (!session?.accessToken) return;
    setSavingResponse(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/response`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ response: null }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, ownerResponse: null, ownerRespondedAt: null }
              : r
          )
        );
        setRespondingId(null);
        setResponseText('');
        toast({ title: 'Respuesta eliminada' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar la respuesta', variant: 'destructive' });
    } finally {
      setSavingResponse(false);
    }
  };

  const submitFlag = async () => {
    if (!flagDialogId || !flagReason || !session?.accessToken) return;
    setSavingFlag(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews/${flagDialogId}/flag`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ reason: flagReason }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === flagDialogId
              ? { ...r, flaggedByOwner: true, flagReason: flagReason }
              : r
          )
        );
        setFlagDialogId(null);
        setFlagReason('');
        toast({ title: 'Resena reportada', description: 'TurnoLink revisara el reporte' });
      } else {
        const err = await res.json().catch(() => null);
        toast({
          title: 'No se pudo reportar',
          description: err?.message || 'Error al reportar la resena',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo reportar la resena', variant: 'destructive' });
    } finally {
      setSavingFlag(false);
    }
  };

  // ============ Filters ============

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer.name.toLowerCase().includes(query) ||
          r.booking?.service?.name?.toLowerCase().includes(query) ||
          (r.comment && r.comment.toLowerCase().includes(query))
      );
    }

    if (ratingFilter !== null) {
      filtered = filtered.filter((r) => r.rating === ratingFilter);
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((r) =>
        visibilityFilter === 'visible' ? r.isVisible : !r.isVisible
      );
    }

    return filtered;
  }, [reviews, searchQuery, ratingFilter, visibilityFilter]);

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ratingFilter, visibilityFilter]);

  // ============ CSV Export ============

  const exportToCSV = () => {
    const headers = ['Cliente', 'Email', 'Servicio', 'Calificacion', 'Comentario', 'Respuesta', 'Reportada', 'Fecha', 'Visible'];
    const rows = filteredReviews.map((r) => [
      r.customer.name,
      r.customer.email || '',
      r.booking?.service?.name || '',
      r.rating.toString(),
      (r.comment || '').replace(/,/g, ';'),
      (r.ownerResponse || '').replace(/,/g, ';'),
      r.flaggedByOwner ? (FLAG_REASONS[r.flagReason || ''] || 'Si') : 'No',
      new Date(r.createdAt).toLocaleDateString('es-AR'),
      r.isVisible ? 'Si' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resenas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportacion exitosa',
      description: `Se exportaron ${filteredReviews.length} resenas`,
    });
  };

  // ============ Helpers ============

  const filteredGastroReviews = useMemo(() => {
    if (!gastroSearchQuery) return gastroReviews;
    const q = gastroSearchQuery.toLowerCase();
    return gastroReviews.filter(r =>
      r.review.toLowerCase().includes(q) ||
      `mesa ${r.tableNumber}`.includes(q)
    );
  }, [gastroReviews, gastroSearchQuery]);

  const isRecent = (date: string) => {
    const reviewDate = new Date(date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return reviewDate > sevenDaysAgo;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            )}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  // ============ Loading ============

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-xl border p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div>
                  <div className="h-6 w-12 bg-muted rounded mb-1" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b">
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-48 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============ Render ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Reseñas y Reputación</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Gestiona las reseñas de tus {clientLabelPlural.toLowerCase()} y mejora tu reputación
              </p>
            </div>
          </div>
          {reviews.length > 0 && (
            <Button variant="outline" onClick={exportToCSV} className="border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for gastro tenants */}
      {isGastro && (
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('gastro')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'gastro'
                ? "bg-white dark:bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UtensilsCrossed className="h-4 w-4 inline mr-2" />
            Opiniones del salón ({gastroReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'booking'
                ? "bg-white dark:bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className="h-4 w-4 inline mr-2" />
            Reseñas de reservas ({reviews.length})
          </button>
        </div>
      )}

      {/* Gastro Reviews Section */}
      {isGastro && activeTab === 'gastro' && (
        <>
          {/* Gastro stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{gastroReviews.length}</p>
                  <p className="text-xs text-muted-foreground">Opiniones de comensales</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {gastroReviews.filter(r => {
                      const d = new Date(r.updatedAt);
                      const week = new Date();
                      week.setDate(week.getDate() - 7);
                      return d > week;
                    }).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Últimos 7 días</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UtensilsCrossed className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {gastroReviews.length > 0
                      ? `$${Math.round(gastroReviews.reduce((acc, r) => acc + r.tipAmount, 0)).toLocaleString('es-AR')}`
                      : '$0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Propinas totales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gastro search */}
          <div className="bg-card rounded-xl border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por opinión o mesa..."
                value={gastroSearchQuery}
                onChange={(e) => setGastroSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {filteredGastroReviews.length === gastroReviews.length
                ? `${gastroReviews.length} opiniones en total`
                : `${filteredGastroReviews.length} de ${gastroReviews.length} opiniones`}
            </p>
          </div>

          {/* Gastro reviews list */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Opiniones de comensales</h3>
            </div>

            {filteredGastroReviews.length === 0 ? (
              <div className="p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">
                  {gastroReviews.length === 0 ? 'No hay opiniones todavía' : 'No se encontraron opiniones'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {gastroReviews.length === 0
                    ? 'Las opiniones aparecerán aquí cuando los comensales dejen su opinión al pagar'
                    : 'Probá ajustando el término de búsqueda'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredGastroReviews.map((gr) => (
                  <div key={gr.id} className="p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {gr.tableNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">Mesa {gr.tableNumber}</span>
                          {gr.tipAmount > 0 && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                              Propina ${Math.round(gr.tipAmount).toLocaleString('es-AR')}
                            </Badge>
                          )}
                          {gr.totalAmount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Cuenta ${Math.round(gr.totalAmount).toLocaleString('es-AR')}
                            </Badge>
                          )}
                          {isRecent(gr.updatedAt) && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(gr.updatedAt).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm italic">&ldquo;{gr.review}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Booking Reviews Section - show always for non-gastro, or when booking tab active for gastro */}
      {(!isGastro || activeTab === 'booking') && <>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Average Rating */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Star className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <p className={cn("text-3xl font-bold", getRatingColor(stats.averageRating))}>
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Calificacion promedio</p>
              </div>
            </div>
            <div className="mt-3">{renderStars(Math.round(stats.averageRating), 'md')}</div>
          </div>

          {/* Total Reviews */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalReviews}</p>
                <p className="text-xs text-muted-foreground">Total resenas</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.recentBookingsCount}</p>
                <p className="text-xs text-muted-foreground">{terms.bookingPlural} (7 dias)</p>
              </div>
            </div>
          </div>

          {/* Visible Reviews */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {reviews.filter((r) => r.isVisible).length}
                </p>
                <p className="text-xs text-muted-foreground">Resenas visibles</p>
              </div>
            </div>
          </div>

          {/* Hide Quota */}
          {hideQuota && (
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {hideQuota.remaining}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ocultas disponibles ({hideQuota.hidden}/{hideQuota.maxHideable})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.ratingDistribution.length > 0 && (
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Distribucion de calificaciones
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const dist = stats.ratingDistribution.find((d) => d.rating === rating);
              const count = dist?.count || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                  className={cn(
                    "flex items-center gap-3 w-full p-2 rounded-lg transition-colors hover:bg-muted/50",
                    ratingFilter === rating && "bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-800"
                  )}
                >
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        rating >= 4 ? "bg-green-500" : rating >= 3 ? "bg-amber-400" : "bg-red-400"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </button>
              );
            })}
          </div>
          {ratingFilter !== null && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setRatingFilter(null)}
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar filtro
            </Button>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente, servicio o comentario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-muted")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {(ratingFilter !== null || visibilityFilter !== 'all') && (
              <Badge className="ml-2 bg-brand-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {(ratingFilter !== null ? 1 : 0) + (visibilityFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Visibilidad</p>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'visible', label: 'Visibles' },
                  { value: 'hidden', label: 'Ocultas' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setVisibilityFilter(option.value as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      visibilityFilter === option.value
                        ? "bg-brand-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {(ratingFilter !== null || visibilityFilter !== 'all' || searchQuery) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRatingFilter(null);
                    setVisibilityFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-3">
          {filteredReviews.length === reviews.length
            ? `${reviews.length} resenas en total`
            : `${filteredReviews.length} de ${reviews.length} resenas`}
        </p>
      </div>

      {/* Reviews List */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">
            {ratingFilter !== null
              ? `Resenas de ${ratingFilter} estrella${ratingFilter > 1 ? 's' : ''}`
              : 'Todas las resenas'}
          </h3>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">
              {reviews.length === 0 ? 'No hay resenas todavia' : 'No se encontraron resenas'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {reviews.length === 0
                ? `Las resenas apareceran aqui cuando tus ${clientLabelPlural.toLowerCase()} califiquen su experiencia`
                : 'Prueba ajustando los filtros o el termino de busqueda'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {paginatedReviews.map((review) => (
                <div key={review.id} className={cn(
                  "p-4 transition-colors hover:bg-muted/30",
                  !review.isVisible && "bg-muted/20"
                )}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
                      review.rating >= 4 ? "bg-gradient-to-br from-green-400 to-emerald-500" :
                      review.rating >= 3 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                      "bg-gradient-to-br from-red-400 to-teal-500"
                    )}>
                      {review.customer.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{review.customer.name}</span>
                        {renderStars(review.rating, 'sm')}
                        {isRecent(review.createdAt) && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Nuevo
                          </Badge>
                        )}
                        {!review.isVisible && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Oculta
                          </Badge>
                        )}
                        {review.flaggedByOwner && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                            <Flag className="h-3 w-3 mr-1" />
                            Reportada: {FLAG_REASONS[review.flagReason || ''] || review.flagReason}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{review.booking?.service?.name || 'Sin servicio'}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </p>

                      {review.comment && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                        </div>
                      )}

                      {!review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          Sin comentario
                        </p>
                      )}

                      {/* Owner Response Display */}
                      {review.ownerResponse && respondingId !== review.id && (
                        <div className="mt-3 pl-3 border-l-2 border-teal-400 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 rounded-r-lg p-3">
                          <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-1">Tu respuesta</p>
                          <p className="text-sm text-slate-700 dark:text-neutral-300">{review.ownerResponse}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {review.ownerRespondedAt && new Date(review.ownerRespondedAt).toLocaleDateString('es-AR', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Response Editor */}
                      {respondingId === review.id && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Escribe tu respuesta..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="min-h-[80px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveResponse(review.id)}
                              disabled={savingResponse || !responseText.trim()}
                            >
                              {savingResponse ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                              Guardar
                            </Button>
                            {review.ownerResponse && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteResponse(review.id)}
                                disabled={savingResponse}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar respuesta
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setRespondingId(null); setResponseText(''); }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={review.isVisible ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleVisibility(review.id, !review.isVisible)}
                        disabled={updatingId === review.id}
                        className="min-w-[100px]"
                      >
                        {updatingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : review.isVisible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Mostrar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRespondingId(review.id);
                          setResponseText(review.ownerResponse || '');
                        }}
                        className="min-w-[100px]"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        {review.ownerResponse ? 'Editar' : 'Responder'}
                      </Button>
                      {!review.flaggedByOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setFlagDialogId(review.id); setFlagReason(''); }}
                          className="min-w-[100px] text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Reportar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Pagina {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tips */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Consejos para mejorar tu reputacion
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
              Las resenas visibles se muestran en tu pagina publica de reservas
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
              Responde a las resenas negativas para mostrar que te importa
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
              Solicita resenas a {clientLabelPlural.toLowerCase()} satisfechos despues de cada {terms.bookingSingular.toLowerCase()}
            </li>
          </ul>
        </div>
      )}

      {/* Flag Dialog */}
      <Dialog open={!!flagDialogId} onOpenChange={(open) => { if (!open) setFlagDialogId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Reportar resena
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona el motivo del reporte. TurnoLink revisara la resena.
            </p>
            <Select value={flagReason} onValueChange={setFlagReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="fake">Resena falsa</SelectItem>
                <SelectItem value="inappropriate">Contenido inapropiado</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFlagDialogId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={submitFlag}
              disabled={!flagReason || savingFlag}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {savingFlag ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Flag className="h-4 w-4 mr-1" />}
              Reportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </>}{/* End booking reviews conditional */}
    </div>
  );
}
