'use client';

import { SessionProvider, signOut, useSession as useNextAuthSession } from 'next-auth/react';
import { ReactNode, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useNextAuthSession();
  const router = useRouter();

  // Handle session errors (e.g., token refresh failed)
  useEffect(() => {
    if ((session as { error?: string })?.error === 'RefreshAccessTokenError') {
      // Force sign out if refresh token failed
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for protected routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for public routes - redirects to dashboard if already authenticated
 */
export function useRedirectIfAuthenticated(redirectUrl = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for role-based access
 */
export function useRequireRole(
  allowedRoles: string[],
  redirectUrl = '/dashboard'
) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push(redirectUrl);
    }
  }, [user, isLoading, allowedRoles, router, redirectUrl]);

  return {
    hasAccess: user && allowedRoles.includes(user.role),
    isLoading,
  };
}
