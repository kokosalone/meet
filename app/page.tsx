'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import styles from '../styles/Home.module.css';

const FAMILY_ROOM = 'family';
const STORAGE_KEY = 'recent_rooms';

function useRoomNames(room: string) {
  const [names, setNames] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setNames(null);
    if (!room) return;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/room-status?room=${encodeURIComponent(room)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setNames(Array.isArray(data.names) ? data.names : []);
      } catch {
        /* ignore */
      }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [room]);

  return names;
}

function statusText(names: string[] | null) {
  if (names === null) return 'စစ်နေပါတယ်...';
  if (names.length === 0) return 'အခု ဘယ်သူမှ မရှိသေးပါ';
  return `ခေါ်ဆိုမှုထဲမှာ (${names.length}): ${names.join(', ')}`;
}

export default function Page() {
  const router = useRouter();
  const [custom, setCustom] = React.useState('');
  const [recent, setRecent] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          setRecent(list.filter((r) => typeof r === 'string').slice(0, 5));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const customRoom = custom.trim().toLowerCase().replace(/\s+/g, '-');
  const familyNames = useRoomNames(FAMILY_ROOM);
  const customNames = useRoomNames(customRoom);

  const go = (room: string) => {
    if (room !== FAMILY_ROOM) {
      const next = [room, ...recent.filter((r) => r !== room)].slice(0, 5);
      setRecent(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
    router.push(`/rooms/${encodeURIComponent(room)}`);
  };

  const familyIn = familyNames !== null && familyNames.length > 0;
  const customIn = customNames !== null && customNames.length > 0;

  return (
    <main className={styles.main} data-lk-theme="default">
      <div className="header">
        <h1 style={{ fontSize: '32px', margin: 0 }}>သမိုင်းမိသားစု</h1>
        <h2 style={{ marginTop: '8px' }}>မိသားစု video call</h2>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ textAlign: 'center', fontWeight: 600 }}>မိသားစုအားလုံး</div>
          <div style={{ textAlign: 'center' }}>{statusText(familyNames)}</div>
          <button
            className="lk-button"
            style={{ width: '100%', padding: '14px' }}
            onClick={() => go(FAMILY_ROOM)}
          >
            {familyIn ? 'ဝင်မယ်' : 'Family room ခေါ်မယ်'}
          </button>
        </div>

        <hr style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', margin: 0 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ textAlign: 'center', fontWeight: 600 }}>ကိုယ်ကြိုက်တဲ့သူနဲ့ ခေါ်မယ်</div>
          <div style={{ textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
            ခေါ်မယ့်သူတွေ အားလုံး room နာမည် တူတူ ရိုက်ထည့်ပါ (ဥပမာ mom-dad)
          </div>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="room နာမည်"
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #666',
              background: '#111',
              color: '#fff',
              fontSize: '16px',
            }}
          />
          {customRoom && <div style={{ textAlign: 'center' }}>{statusText(customNames)}</div>}
          <button
            className="lk-button"
            style={{ width: '100%', padding: '14px' }}
            disabled={!customRoom}
            onClick={() => go(customRoom)}
          >
            {customIn ? 'ဝင်မယ်' : 'ခေါ်မယ်'}
          </button>

          {recent.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {recent.map((r) => (
                <button key={r} className="lk-button" onClick={() => setCustom(r)}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
