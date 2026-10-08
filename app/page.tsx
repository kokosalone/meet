'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import styles from '../styles/Home.module.css';

export default function Page() {
  const router = useRouter();
  const [names, setNames] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/room-status', { cache: 'no-store' });
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
  }, []);

  const inCall = names !== null && names.length > 0;

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
        <div style={{ textAlign: 'center' }}>
          {names === null
            ? 'စစ်နေပါတယ်...'
            : inCall
              ? `ခေါ်ဆိုမှုထဲမှာ (${names.length}): ${names.join(', ')}`
              : 'အခု ဘယ်သူမှ မရှိသေးပါ'}
        </div>
        <button
          className="lk-button"
          style={{ width: '100%', padding: '14px' }}
          onClick={() => router.push('/rooms/family')}
        >
          {inCall ? 'ဝင်မယ်' : 'Family room ခေါ်မယ်'}
        </button>
      </div>
    </main>
  );
}
