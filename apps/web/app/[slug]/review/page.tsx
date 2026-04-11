'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

interface BookingInfo {
  businessName: string;
  businessLogo: string | null;
  serviceName: string;
  customerName: string;
  date: string;
  alreadyReviewed: boolean;
}

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const bookingId = searchParams.get('bookingId') || '';
  const presetRating = searchParams.get('rating');

  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(presetRating ? parseInt(presetRating, 10) : 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  // Load booking info
  useEffect(() => {
    if (!token || !bookingId) {
      setError('Enlace de reseña inválido');
      setLoading(false);
      return;
    }

    const loadInfo = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/public/reviews/${params.slug}/booking-info?bookingId=${bookingId}&token=${token}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'No se pudo cargar la información');
        }
        const data: BookingInfo = await res.json();
        setBookingInfo(data);
        if (data.alreadyReviewed) {
          setSubmitted(true);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, [params.slug, token, bookingId]);

  const handleSubmit = async () => {
    if (rating === 0 || !token || !bookingId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/reviews/${params.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, token, rating, comment: comment.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al enviar la reseña');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Error state
  if (error && !bookingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No se pudo cargar</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {bookingInfo?.alreadyReviewed ? 'Ya dejaste tu reseña' : 'Gracias por tu reseña'}
          </h1>
          <p className="text-gray-500 mb-6">
            {bookingInfo?.alreadyReviewed
              ? `Ya calificaste tu experiencia en ${bookingInfo?.businessName}.`
              : `Tu opinion ayuda a mejorar el servicio de ${bookingInfo?.businessName}.`
            }
          </p>
          {rating > 0 && !bookingInfo?.alreadyReviewed && (
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-8 w-8',
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          )}
          <a
            href={`/${params.slug}`}
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
          >
            Reservar otro turno
          </a>
        </div>
      </div>
    );
  }

  const formattedDate = bookingInfo?.date
    ? new Date(bookingInfo.date).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Review form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-5 flex items-center gap-3">
          {bookingInfo?.businessLogo && (
            <img
              src={bookingInfo.businessLogo}
              alt={bookingInfo.businessName}
              className="h-10 w-10 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">{bookingInfo?.businessName}</h1>
            <p className="text-sm text-gray-500">Califica tu experiencia</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Service info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tu turno</p>
          <p className="font-semibold text-gray-900">{bookingInfo?.serviceName}</p>
          <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
        </div>

        {/* Star rating */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 text-center">
          <p className="text-base font-medium text-gray-900 mb-1">
            {bookingInfo?.customerName}, como fue tu experiencia?
          </p>
          <p className="text-sm text-gray-500 mb-5">Toca las estrellas para calificar</p>

          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    'h-10 w-10 sm:h-12 sm:w-12 transition-colors',
                    star <= (hoveredStar || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 hover:text-amber-200'
                  )}
                />
              </button>
            ))}
          </div>

          {(hoveredStar || rating) > 0 && (
            <p className="text-sm font-medium text-amber-600">
              {ratingLabels[hoveredStar || rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        {rating > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contanos mas (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Como fue la atencion? Que te parecio el servicio?"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-base transition-all',
            rating > 0
              ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] shadow-lg shadow-teal-600/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            'Enviar resena'
          )}
        </button>

        {/* Powered by */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by{' '}
          <a href="https://turnolink.com.ar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            TurnoLink
          </a>
        </p>
      </div>
    </div>
  );
}
