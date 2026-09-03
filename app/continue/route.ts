import { NextResponse } from 'next/server';
import { verifyEnrollmentToken } from '@/lib/enrollment-access';

export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const formUrl = process.env.GOOGLE_FORM_URL || 'https://forms.gle/izrCmYaofXN6tgyJ8';
  if (!verifyEnrollmentToken(token)) {
    return NextResponse.redirect(new URL('/?access=expired', request.url), 303);
  }
  return NextResponse.redirect(formUrl, 303);
}
