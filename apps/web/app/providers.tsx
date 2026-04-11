'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState, createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';

// =============================================================================
// Auth Context
// =============================================================================

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
  } | null;
  accessToken: string | null;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Handle session errors (e.g., token refresh failed)
  useEffect(() => {
    if ((session as { error?: string })?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login?error=session_expired' });
    }
  }, [session]);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: status === 'authenticated' && !!session?.user,
    isLoading: status === 'loading',
    user: session?.user || null,
    accessToken: session?.accessToken || null,
    error: (session as { error?: string })?.error || null,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Providers');
  }
  return context;
}

// =============================================================================
// Main Providers
// =============================================================================

export function Providers({ children }: { children: React.ReactNode }) {
  // Scroll focused inputs into view on mobile when keyboard opens
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Delay to wait for keyboard to appear
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // Global safety net for ChunkLoadError after a redeploy.
  // When a client holds HTML from a previous build and navigates (router.back,
  // router.push), Next tries to load chunks whose hashes may no longer exist.
  // Those failures don't always reach the error boundary — router.prefetch and
  // dynamic imports can swallow them as console errors or unhandled rejections.
  // This listener catches them and reloads once, transparently.
  useEffect(() => {
    const CHUNK_PATTERNS = [
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'failed to fetch dynamically imported module',
    ];
    const RELOAD_KEY = 'turnolink-chunk-reload';
    const RELOAD_DEBOUNCE_MS = 30_000;

    const matchesChunkError = (value: unknown): boolean => {
      if (!value) return false;
      const text = value instanceof Error
        ? `${value.name} ${value.message}`
        : typeof value === 'string'
        ? value
        : String((value as { message?: unknown })?.message ?? '');
      return CHUNK_PATTERNS.some((p) => text.includes(p));
    };

    const tryReload = () => {
      const last = sessionStorage.getItem(RELOAD_KEY);
      const now = Date.now();
      if (!last || now - Number(last) > RELOAD_DEBOUNCE_MS) {
        sessionStorage.setItem(RELOAD_KEY, String(now));
        window.location.reload();
      }
    };

    const onError = (e: ErrorEvent) => {
      if (matchesChunkError(e.error) || matchesChunkError(e.message)) {
        tryReload();
      }
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (matchesChunkError(e.reason)) {
        tryReload();
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 401/403 errors
              if (error instanceof Error && error.message.includes('401')) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthContextProvider>{children}</AuthContextProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
