import { NextRequest, NextResponse } from 'next/server';

async function hashToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_portfolio_admin');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const needsAuth =
    (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) ||
    (pathname.startsWith('/api/artworks') && ['POST', 'PUT', 'DELETE'].includes(method));

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
  matcher: ['/admin/:path*', '/api/artworks/:path*'],
};
