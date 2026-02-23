import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * OAuth callback handler for Mercado Pago
 *
 * This route receives the OAuth callback from Mercado Pago and proxies it
 * to the backend API for token exchange.
 *
 * Flow:
 * 1. MP redirects to this route with code and state params
 * 2. This route forwards to backend /api/mercadopago/oauth/callback
 * 3. Backend exchanges code for tokens and redirects to /pagos
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth error
  if (error) {
    const errorMessage = errorDescription || error || 'Error de autenticación';
    return NextResponse.redirect(
      new URL(`/pagos?mp_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/pagos?mp_error=Parámetros de OAuth faltantes', request.url)
    );
  }

  // Redirect to backend OAuth callback handler
  // The backend will exchange the code for tokens and redirect back to /pagos
  const backendCallbackUrl = new URL(`${API_URL}/api/mercadopago/oauth/callback`);
  backendCallbackUrl.searchParams.set('code', code);
  backendCallbackUrl.searchParams.set('state', state);

  return NextResponse.redirect(backendCallbackUrl.toString());
}
