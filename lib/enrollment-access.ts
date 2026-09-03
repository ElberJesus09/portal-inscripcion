import { createHmac, timingSafeEqual } from 'node:crypto';

const ACCESS_DURATION_SECONDS = 60 * 15;

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET no está configurada.');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createEnrollmentToken(paymentId: string | number) {
  const expires = Math.floor(Date.now() / 1000) + ACCESS_DURATION_SECONDS;
  const payload = `payment:${paymentId}:${expires}`;
  return `${payload}:${sign(payload)}`;
}

export function verifyEnrollmentToken(token: string) {
  const [kind, paymentId, expiresText, received] = token.split(':');
  if (kind !== 'payment' || !paymentId || !expiresText || !received) return false;
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  try {
    const expected = sign(`${kind}:${paymentId}:${expiresText}`);
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
