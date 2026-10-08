import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const room = (req.nextUrl.searchParams.get('room') || 'family').slice(0, 100);
  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!url || !key || !secret) {
    return NextResponse.json({ names: [] });
  }
  try {
    const host = url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
    const client = new RoomServiceClient(host, key, secret);
    const participants = await client.listParticipants(room);
    const names = participants.map((p) => p.name || p.identity);
    return NextResponse.json({ names });
  } catch {
    return NextResponse.json({ names: [] });
  }
}
