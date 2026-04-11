'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  serviceName: string | null;
  createdAt: string;
  ownerResponse: string | null;
  ownerRespondedAt: string | null;
}

interface ReviewsData {
  reviews: ReviewItem[];
  total: number;
  hasMore: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

// ============ Helpers ============

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : star - 0.5 <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-gray-300 dark:text-neutral-600'
          )}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} anos`;
}

// ============ ReviewCard ============

function ReviewCard({ review, compact = false }: { review: ReviewItem; compact?: boolean }) {
  return (
    <div className={cn(
      "bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4",
      !compact && "transition-shadow hover:shadow-md"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {review.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm leading-tight">
              {review.customerName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {review.comment && (
        <p className={cn(
          "text-sm text-slate-600 dark:text-neutral-300 leading-relaxed",
          !compact && "line-clamp-3"
        )}>
          {review.comment}
        </p>
      )}

      {review.serviceName && (
        <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-2">
          {review.serviceName}
        </p>
      )}

      {review.ownerResponse && (
        <div className="mt-3 pl-3 border-l-2 border-teal-400 dark:border-teal-500">
          <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400 mb-0.5">
            Respuesta del negocio
          </p>
          <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
            {review.ownerResponse}
          </p>
        </div>
      )}
    </div>
  );
}

// ============ Mobile Carousel ============

function ReviewCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const slides = reviews.slice(0, 3);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    // Only horizontal swipe if |diffX| > |diffY| (don't interfere with scroll)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX < 0 && current < slides.length - 1) goTo(current + 1);
      if (diffX > 0 && current > 0) goTo(current - 1);
    }
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((review) => (
          <div key={review.id} className="w-full flex-shrink-0 px-0.5">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-5 bg-teal-500"
                  : "w-1.5 bg-slate-300 dark:bg-neutral-600"
              )}
              aria-label={`Resena ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ All Reviews List (for Sheet/Dialog) ============

function AllReviewsList({ slug, total }: { slug: string; total: number }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async (offset: number) => {
    try {
      const res = await fetch(`${API_URL}/api/public/reviews/${slug}?limit=10&offset=${offset}`);
      if (res.ok) {
        const data: ReviewsData = await res.json();
        if (offset === 0) {
          setReviews(data.reviews);
        } else {
          setReviews((prev) => [...prev, ...data.reviews]);
        }
        setHasMore(data.hasMore);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadReviews(0);
  }, [loadReviews]);

  return (
    <div className="space-y-3 overflow-y-auto flex-1">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} compact />
          ))}
          {hasMore && (
            <button
              onClick={() => loadReviews(reviews.length)}
              className="w-full py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cargar mas resenas
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ============ Main Component ============

export function PublicReviewsSection({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/public/reviews/${slug}?limit=4`),
          fetch(`${API_URL}/api/public/reviews/${slug}/stats`),
        ]);

        if (reviewsRes.ok) {
          const data: ReviewsData = await reviewsRes.json();
          setReviews(data.reviews);
          setTotal(data.total);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({ averageRating: data.averageRating, totalReviews: data.totalReviews });
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (!loading && total === 0) return null;
  if (loading) return null;

  const showSeeAll = total > (isMobile ? 3 : 4);

  return (
    <>
      <section className="relative z-10 py-5 md:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Compact Header — title + average + stars in one line */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Resenas
                </h2>
              </div>
              {stats && stats.totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <StarRating rating={Math.round(stats.averageRating)} size="md" />
                  <span className="text-xs text-slate-500 dark:text-neutral-400">
                    ({stats.totalReviews})
                  </span>
                </div>
              )}
            </div>

            {/* Mobile: Carousel (max 3 slides) */}
            <div className="md:hidden">
              <ReviewCarousel reviews={reviews} />
            </div>

            {/* Desktop: Grid 2x2 (max 4 cards) */}
            <div className="hidden md:grid md:grid-cols-2 gap-3">
              {reviews.slice(0, 4).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* See All button */}
            {showSeeAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-3 flex items-center gap-1 mx-auto text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                Ver todas las {total} resenas
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mobile: Bottom Sheet */}
      {isMobile && (
        <Sheet open={showAll} onOpenChange={setShowAll}>
          <SheetContent side="bottom" className="max-h-[85vh] max-h-[85dvh]">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center justify-between">
                <span>Todas las resenas</span>
                {stats && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold">{stats.averageRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(stats.averageRating)} size="sm" />
                    <span className="text-xs text-slate-500">({total})</span>
                  </div>
                )}
              </SheetTitle>
            </SheetHeader>
            <AllReviewsList slug={slug} total={total} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Dialog */}
      {!isMobile && (
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <span>Todas las resenas</span>
                {stats && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold">{stats.averageRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(stats.averageRating)} size="sm" />
                    <span className="text-xs text-slate-500">({total})</span>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            <AllReviewsList slug={slug} total={total} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
