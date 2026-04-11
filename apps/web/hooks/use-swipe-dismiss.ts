'use client';

import { useRef, useEffect, useState } from 'react';

interface UseSwipeDismissOptions {
  onDismiss: () => void;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Swipe-down-to-dismiss for detail views.
 * Listens on document.body (where scroll actually happens),
 * but only activates when touch started inside the containerRef.
 */
export function useSwipeDismiss({ onDismiss, threshold = 90, enabled = true }: UseSwipeDismissOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isInsideContainer = useRef(false);
  const dismissed = useRef(false);
  const rafId = useRef<number>(0);
  const [dragY, setDragY] = useState(0);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Only activate if touch started inside our container
      const target = e.target as Node;
      isInsideContainer.current = container.contains(target);
      if (!isInsideContainer.current) return;

      startY.current = e.touches[0].clientY;
      isDragging.current = false;
      dismissed.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isInsideContainer.current || dismissed.current) return;

      const deltaY = e.touches[0].clientY - startY.current;

      // Only intercept downward movement (finger going down)
      if (deltaY > 15) {
        if (!isDragging.current) {
          isDragging.current = true;
        }
        // Prevent the body from scrolling while we're dragging
        e.preventDefault();

        cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          const dampened = Math.min(deltaY * 0.45, 250);
          setDragY(dampened);
        });
      } else if (deltaY < -5 && isDragging.current) {
        // User reversed direction (scrolling up) — cancel drag
        isDragging.current = false;
        cancelAnimationFrame(rafId.current);
        setDragY(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isInsideContainer.current) return;
      cancelAnimationFrame(rafId.current);

      if (isDragging.current) {
        // Read current dragY from the ref-like approach
        setDragY(prev => {
          if (prev > threshold * 0.45) {
            dismissed.current = true;
            // Animate out
            requestAnimationFrame(() => setDragY(500));
            setTimeout(() => {
              onDismissRef.current();
              setDragY(0);
            }, 140);
          } else {
            return 0;
          }
          return prev;
        });
      }

      isDragging.current = false;
      isInsideContainer.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold]);

  return { containerRef, dragY };
}
