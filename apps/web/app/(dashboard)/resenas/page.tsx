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
  Calendar,
  Sparkles,
  ThumbsUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
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

interface Stats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
  recentBookingsCount: number;
  recentBookingsText: string;
}

const ITEMS_PER_PAGE = 10;

export default function ResenasPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/reviews`,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/reviews/stats`,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          ),
        ]);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  const toggleVisibility = async (reviewId: string, isVisible: boolean) => {
    if (!session?.accessToken) return;
    setUpdatingId(reviewId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/reviews/${reviewId}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ isVisible }),
        }
      );

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isVisible } : r))
        );
        toast({
          title: isVisible ? 'Resena visible' : 'Resena oculta',
          description: isVisible
            ? 'La resena ahora se muestra en tu pagina publica'
            : 'La resena ya no se muestra en tu pagina publica',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la resena',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer.name.toLowerCase().includes(query) ||
          r.booking.service.name.toLowerCase().includes(query) ||
          (r.comment && r.comment.toLowerCase().includes(query))
      );
    }

    // Rating filter
    if (ratingFilter !== null) {
      filtered = filtered.filter((r) => r.rating === ratingFilter);
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((r) =>
        visibilityFilter === 'visible' ? r.isVisible : !r.isVisible
      );
    }

    return filtered;
  }, [reviews, searchQuery, ratingFilter, visibilityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ratingFilter, visibilityFilter]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Cliente', 'Email', 'Servicio', 'Calificacion', 'Comentario', 'Fecha', 'Visible'];
    const rows = filteredReviews.map((r) => [
      r.customer.name,
      r.customer.email,
      r.booking.service.name,
      r.rating.toString(),
      r.comment || '',
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

  // Check if review is recent (last 7 days)
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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

        {/* Reviews skeleton */}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Resenas y Reputacion
          </h1>
          <p className="text-muted-foreground">
            Gestiona las resenas de tus clientes y mejora tu reputacion
          </p>
        </div>
        {reviews.length > 0 && (
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Response Rate (simulated) */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.recentBookingsCount}</p>
                <p className="text-xs text-muted-foreground">Turnos (7 dias)</p>
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
          {/* Search */}
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

          {/* Filter Toggle */}
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

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
            {/* Visibility Filter */}
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

            {/* Clear All Filters */}
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

        {/* Results count */}
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
                ? 'Las resenas apareceran aqui cuando tus clientes califiquen su experiencia'
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
                      </div>

                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{review.booking.service.name}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </p>

                      {review.comment && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm italic">"{review.comment}"</p>
                        </div>
                      )}

                      {!review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          Sin comentario
                        </p>
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
              Solicita resenas a clientes satisfechos despues de cada turno
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
