'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const GROUPS: { id: string; label: string }[] = [
  { id: 'family', label: 'မိသားစုအားလုံး' },
  { id: 'lay&nieces', label: 'တူ၊တူမများ' },
  { id: 'we2', label: 'ခိုင်စ' },
  { id: 'House', label: 'အိမ်အကြောင်း' },
];

const STORAGE_KEY = 'recent_rooms';

function roomUrl(room: string) {
  return `${window.location.origin}/rooms/${encodeURIComponent(room)}`;
}

function inviteText(label: string) {
  return `📞 ${label} မှာ ခေါ်နေပါတယ်၊ ဝင်ပါ\n(သမိုင်းမိသားစု app ထဲက "${label}" ကို နှိပ်ပါ)`;
}

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

function InviteButton(props: { room: string; label: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const fullMessage = () => `${inviteText(props.label)}\n${roomUrl(props.room)}`;

  const invite = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: inviteText(props.label), url: roomUrl(props.room) });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('ကူးယူပါ', fullMessage());
    }
  };

  const links = () => {
    const enc = encodeURIComponent;
    return [
      {
        name: 'Telegram',
        href: `https://t.me/share/url?url=${enc(roomUrl(props.room))}&text=${enc(inviteText(props.label))}`,
        blank: true,
      },
      { name: 'Viber', href: `viber://forward?text=${enc(fullMessage())}`, blank: false },
      { name: 'SMS', href: `sms:?body=${enc(fullMessage())}`, blank: false },
    ];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button className="lk-button" onClick={invite}>
        ဖိတ်မယ်
      </button>
      {open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {links().map((l) => (
            <a
              key={l.name}
              className="lk-button"
              href={l.href}
              target={l.blank ? '_blank' : undefined}
              rel="noopener noreferrer"
