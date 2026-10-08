import { NextRequest, NextResponse } from 'next/server';

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(req: NextRequest) {
  const password = process.env.FAMILY_PASSWORD;
  if (!password) return NextResponse.next();

  const expected = await sha256Hex('fam:' + password);
  const cookie = req.cookies.get('fam_auth')?.value;
  if (cookie === expected) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = '/unlock';
  url.search = '';
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!unlock|api/unlock|_next|favicon.ico|apple-icon.png|images).*)'],
};
