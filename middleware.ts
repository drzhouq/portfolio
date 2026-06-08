import { NextRequest, NextResponse } from 'next/server';

async function hashToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_portfolio_admin');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const CANONICAL_HOST = 'ariszhou.art';
const REDIRECT_HOSTS = new Set(['www.ariszhou.art', 'portfolio.ariszhou.art']);

export async function middleware(request: NextRequest) {
  // Canonical host: 301 www/portfolio to the bare domain, preserving path + query.
  const host = request.headers.get('host') ?? '';
  if (REDIRECT_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAnalytics = pathname.match(/^\/api\/artworks\/[^/]+\/analytics$/) && method === 'POST';

  const needsAuth =
    (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) ||
    (pathname.startsWith('/api/artworks') && ['POST', 'PUT', 'DELETE'].includes(method) && !isAnalytics) ||
    (pathname.startsWith('/api/merch') && ['POST', 'PUT', 'DELETE'].includes(method)) ||
    (pathname.startsWith('/api/settings') && ['PUT', 'DELETE'].includes(method)) ||
    (pathname.startsWith('/api/upload') && method === 'POST');

  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('admin_session')?.value;
  const expected = await hashToken(process.env.ADMIN_PASSWORD || '');

  if (token !== expected) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher so the canonical-host redirect applies site-wide; the auth
  // checks above remain scoped to admin/api paths by their own conditions.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
