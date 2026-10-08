import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  const password = process.env.FAMILY_PASSWORD;
  if (!password) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  if (body.password !== password) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = createHash('sha256')
    .update('fam:' + password)
    .digest('hex');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('fam_auth', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
