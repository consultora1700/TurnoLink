import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Allow internal calls (same-origin from dashboard) or validate secret for external calls
    const authHeader = request.headers.get('x-revalidate-secret');
    const secret = process.env.REVALIDATE_SECRET;
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    const isInternal = referer.includes(host) || referer.includes('localhost') || referer.includes('127.0.0.1');

    if (!isInternal && (!secret || authHeader !== secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path } = await request.json();
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path required' }, { status: 400 });
    }

    // Sanitize path: only allow paths starting with /
    if (!path.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
