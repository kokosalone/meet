import { NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function db() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)),
    });
  }
  return getFirestore();
}

export async function POST(req: Request) {
  const { name, token } = await req.json();
  if (!name || !token) {
    return NextResponse.json({ error: 'name နဲ့ token လိုပါတယ်' }, { status: 400 });
  }
  const id = String(name).trim().replace(/\//g, '-');
  await db().collection('tokens').doc(id).set({
    name: String(name).trim(),
    token,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
