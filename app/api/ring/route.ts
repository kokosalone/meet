import { NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

function init() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)),
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const room = String(body.room || '').slice(0, 60);
  const label = String(body.label || room).slice(0, 60);
  const from = String(body.from || '').trim().slice(0, 60);
  if (!room || !from) {
    return NextResponse.json({ error: 'room နဲ့ from လိုပါတယ်' }, { status: 400 });
  }

  init();
  const db = getFirestore();

  // ring ကို ၁၅ စက္ကန့်အတွင်း ထပ်ခါထပ်ခါ မပို့အောင် ကာကွယ်
  const ringRef = db.collection('rings').doc(room.replace(/\//g, '-'));
  const last = await ringRef.get();
  if (last.exists && Date.now() - (last.data()?.at || 0) < 15000) {
    return NextResponse.json({ sent: 0, skipped: 'cooldown' }, { status: 429 });
  }
  await ringRef.set({ at: Date.now(), from });

  const snap = await db.collection('tokens').get();
  const targets = snap.docs
    .filter((d) => d.data().token && d.data().name !== from)
    .map((d) => ({ id: d.id, token: d.data().token as string }));
  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  const res = await getMessaging().sendEachForMulticast({
    tokens: targets.map((t) => t.token),
    notification: {
      title: `📞 ${label}`,
      body: `${from} ခေါ်နေပါတယ်၊ ဝင်ပါ`,
    },
    data: { room },
    android: {
      priority: 'high',
      notification: { channelId: 'family_call', sound: 'family_ring' },
    },
  });

  // သက်တမ်းကုန်တဲ့ token တွေကို database ထဲက ဖျက်
  await Promise.all(
    res.responses.map((r, i) => {
      const code = r.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        return db.collection('tokens').doc(targets[i].id).delete();
      }
      return null;
    }),
  );

  return NextResponse.json({ sent: res.successCount, failed: res.failureCount });
}
