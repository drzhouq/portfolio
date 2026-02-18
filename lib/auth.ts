import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

async function signToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_portfolio_admin');
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function setAuthCookie(): Promise<void> {
  const token = await signToken(process.env.ADMIN_PASSWORD || '');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function verifyAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = await signToken(process.env.ADMIN_PASSWORD || '');
  return token === expected;
}

export function verifyPassword(password: string): boolean {
  return password === (process.env.ADMIN_PASSWORD || '');
}
