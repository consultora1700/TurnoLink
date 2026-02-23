'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Loader2, Lock, Key, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminApi } from '@/lib/admin-api';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

interface StoredSession {
  key: string;
  expiresAt: number;
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const session: StoredSession = JSON.parse(stored);

        if (session.expiresAt > Date.now()) {
          adminApi.setAdminKey(session.key);
          const isValid = await adminApi.validateAdminKey(session.key);

          if (isValid) {
            setIsAuthenticated(true);
            // Refresh session expiry
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
              key: session.key,
              expiresAt: Date.now() + SESSION_DURATION,
            }));
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminKey.trim()) {
      setError('Ingresa la clave de administrador');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await adminApi.validateAdminKey(adminKey);

      if (isValid) {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
          key: adminKey,
          expiresAt: Date.now() + SESSION_DURATION,
        }));
        setIsAuthenticated(true);
      } else {
        setError('Clave de administrador incorrecta');
      }
    } catch (err: any) {
      if (err.message?.includes('Too many')) {
        setError('Demasiados intentos fallidos. Espera 15 minutos.');
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    adminApi.clearAdminKey();
    setIsAuthenticated(false);
    setAdminKey('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription className="mt-2">
                Acceso restringido al dueño de la plataforma
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Esta área es exclusiva para el administrador de TurnoLink.
                  Los accesos son monitoreados y registrados.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Clave de administrador
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ingresa tu clave secreta"
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={isValidating}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isValidating || !adminKey.trim()}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Acceder al Panel
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Los intentos de acceso no autorizados serán registrados
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
