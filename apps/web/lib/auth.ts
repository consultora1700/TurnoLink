import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi, isApiError } from './api';

// Token refresh buffer (5 minutes before expiry)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

// JWT expiration time (from backend) - typically 15 minutes
const ACCESS_TOKEN_TTL = 15 * 60 * 1000;

interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  error?: string;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenData> {
  try {
    const data = await authApi.refresh(refreshToken);
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
    };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return {
      accessToken: '',
      refreshToken: '',
      accessTokenExpires: 0,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          const data = await authApi.login(
            credentials.email,
            credentials.password
          );

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            tenantId: data.user.tenantId,
            tenantType: data.user.tenantType || 'BUSINESS',
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          if (isApiError(error)) {
            if (error.isUnauthorized) {
              throw new Error('Email o contraseña incorrectos');
            }
            throw new Error(error.message);
          }
          throw new Error('Error al iniciar sesión');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          tenantId: user.tenantId,
          tenantType: user.tenantType || 'BUSINESS',
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
        };
      }

      // Return previous token if the access token has not expired yet
      const tokenExpires = (token.accessTokenExpires as number) || 0;
      if (Date.now() < tokenExpires - TOKEN_REFRESH_BUFFER) {
        return token;
      }

      // Access token has expired, try to refresh it
      const refreshedTokens = await refreshAccessToken(token.refreshToken as string);

      if (refreshedTokens.error) {
        return {
          ...token,
          error: refreshedTokens.error,
        };
      }

      return {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        accessTokenExpires: refreshedTokens.accessTokenExpires,
      };
    },
    async session({ session, token }) {
      // Pass error to client
      if (token.error) {
        (session as unknown as { error: string }).error = token.error as string;
      }

      session.user = {
        id: token.id as string,
        email: session.user?.email || '',
        name: session.user?.name || '',
        role: token.role as string,
        tenantId: token.tenantId as string,
        tenantType: (token.tenantType as string) || 'BUSINESS',
      };
      session.accessToken = token.accessToken as string;

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
