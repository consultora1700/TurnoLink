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
