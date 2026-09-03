import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken, passwordMatches } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
      return NextResponse.json(
        { ok: false, error: 'El acceso administrativo no está configurado en el servidor.' },
        { status: 503 },
      );
    }
    const body = (await request.json()) as { password?: string };
    if (!passwordMatches(body.password || '')) {
      return NextResponse.json({ ok: false, error: 'Contraseña incorrecta.' }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo iniciar sesión. Inténtalo nuevamente.' },
      { status: 500 },
    );
  }
}
