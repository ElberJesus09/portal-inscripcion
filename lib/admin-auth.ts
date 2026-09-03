import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'cpu_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.SESSION_SECRET || '';
}

function signature(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function createAdminToken() {
  if (!secret()) throw new Error('SESSION_SECRET no está configurada.');
  const expires = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `admin:${expires}`;
  return `${payload}:${signature(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token || !secret()) return false;
  const [role, expiresText, received] = token.split(':');
  if (role !== 'admin' || !expiresText || !received) return false;
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(`${role}:${expiresText}`);
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export function passwordMatches(value: string) {
  const entered = value.trim();
  const expected = (process.env.ADMIN_PASSWORD || '').trim();
  if (!entered || !expected) return false;
  const a = Buffer.from(entered);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
};
