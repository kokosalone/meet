'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import styles from '../styles/Home.module.css';

// ဒီစာရင်းကို ကိုယ်ပြင်ပါ။
// id = room နာမည် (အင်္ဂလိပ်စာလုံးအသေး၊ space မပါ၊ မထပ်ရ)
// label = app ထဲမှာ ပြမယ့်နာမည်
const GROUPS: { id: string; label: string }[] = [
  { id: 'family', label: 'မိသားစုအားလုံး' },
  { id: 'lay&nieces', label: 'တူ၊တူမများ' },
  { id: 'we2', label: 'ခိုင်စ' },
  { id: 'House', label: 'အိမ်အကြောင်း' },
];

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
    const timer = setInterval(load, 8000);
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

function GroupCard(props: { id: string; label: string; onJoin: (room: string) => void }) {
  const names = useRoomNames(props.id);
  const inCall = names !== null && names.length > 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        padding: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
      }}
    >
      <div style={{ fontWeight: 600 }}>{props.label}</div>
      <div style={{ fontSize: '14px' }}>{statusText(names)}</div>
      <button className="lk-button" onClick={() => props.onJoin(props.id)}>
        {inCall ? 'ဝင်မယ်' : 'ခေါ်မယ်'}
      </button>
    </div>
  );
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
  const customNames = useRoomNames(customRoom);
  const customIn = customNames !== null && customNames.length > 0;

  const go = (room: string) => {
    const isPreset = GROUPS.some((g) => g.id === room);
    if (!isPreset) {
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
          gap: '16px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        {GROUPS.map((g) => (
          <GroupCard key={g.id} id={g.id} label={g.label} onJoin={go} />
        ))}

        <hr style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', margin: '8px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ textAlign: 'center', fontWeight: 600 }}>တခြားသူနဲ့ ခေါ်မယ်</div>
          <div style={{ textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
            ခေါ်မယ့်သူတွေ အားလုံး room နာမည် တူတူ ရိုက်ထည့်ပါ
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
