'use client';
import React from 'react';

export default function UnlockPage() {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next') || '/';
        window.location.href = next.startsWith('/') && !next.startsWith('//') ? next : '/';
        return;
      }
      setError('စကားဝှက် မှားနေပါတယ်');
    } catch {
      setError('ချိတ်ဆက်မှု မအောင်မြင်ပါ');
    }
    setBusy(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <form
        onSubmit={submit}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '320px' }}
      >
        <h1 style={{ fontSize: '24px', textAlign: 'center' }}>သမိုင်းမိသားစု</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="စကားဝှက်ထည့်ပါ"
          autoFocus
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #666', background: '#111', color: '#fff', fontSize: '16px' }}
        />
        <button type="submit" className="lk-button" disabled={busy || !password}>
          ဝင်မယ်
        </button>
        {error && <div style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</div>}
      </form>
    </main>
  );
}
