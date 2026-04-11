'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 're_favorites';
const EVENT_NAME = 're_favorites_change';

function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // noop
  }
}

/**
 * Shared favorites state backed by localStorage.
 * All components using this hook stay in sync via a custom event,
 * so toggling a heart on a card instantly reflects on the detail page,
 * the header badge and the favorites view.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
    const onChange = () => setFavorites(readFavorites());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const isFav = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFav = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    writeFavorites(next);
    setFavorites(next);
  }, []);

  const removeFav = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.filter((f) => f !== id);
    writeFavorites(next);
    setFavorites(next);
  }, []);

  const clearFavs = useCallback(() => {
    writeFavorites([]);
    setFavorites([]);
  }, []);

  return { favorites, isFav, toggleFav, removeFav, clearFavs };
}
