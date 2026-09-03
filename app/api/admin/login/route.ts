import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, passwordMatches } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    if (!passwordMatches(body.password || '')) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
