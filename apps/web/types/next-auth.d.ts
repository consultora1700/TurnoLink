import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string | null;
      tenantType: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
    tenantType: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    tenantId: string | null;
    tenantType: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
