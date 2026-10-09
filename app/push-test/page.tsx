'use client';
import React from 'react';

type PushPlugin = {
  addListener: (event: string, cb: (data: unknown) => void) => Promise<unknown>;
  requestPermissions: () => Promise<{ receive: string }>;
  register: () => Promise<void>;
  createChannel: (channel: {
    id: string;
    name: string;
    description?: string;
    sound?: string;
    importance?: number;
    visibility?: number;
    vibration?: boolean;
  }) => Promise<void>;
};

type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    Plugins?: { PushNotifications?: PushPlugin };
  };
};

export default function PushTestPage() {
  const [log, setLog] = React.useState<string[]>([]);
  const [token, setToken] = React.useState('');
  const add = (m: string) => setLog((l) => [...l, m]);

  const start = async () => {
    const cap = (window as CapacitorWindow).Capacitor;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) {
      add('ဒါက APK app မဟုတ်ပါ (browser မှာ ဖွင့်ထားတယ်)');
      return;
    }
    const push = cap.Plugins && cap.Plugins.PushNotifications;
    if (!push) {
      add('PushNotifications plugin မတွေ့ပါ');
      return;
    }
    try {
      await push.addListener('registration', (t) => {
        const value = (t as { value?: string }).value || '';
        setToken(value);
        add('token ရပါပြီ');
      });
      await push.addListener('registrationError', (e) => add('error: ' + JSON.stringify(e)));
      await push.addListener('pushNotificationReceived', (n) =>
        add('လက်ခံရပါပြီ: ' + JSON.stringify(n)),
      );
      const perm = await push.requestPermissions();
      add('permission: ' + perm.receive);
      if (perm.receive !== 'granted') return;
      try {
        await push.createChannel({
          id: 'family_call',
          name: 'မိသားစု ဖုန်းခေါ်ဆိုမှု',
          description: 'ခေါ်ဆိုမှု ဝင်လာရင် ring မြည်ပါမယ်',
          sound: 'family_ring.wav',
          importance: 5,
          visibility: 1,
          vibration: true,
        });
        add('ring channel ဆောက်ပြီးပါပြီ (family_call)');
      } catch (e) {
        add('channel error: ' + String(e));
      }
      await push.register();
    } catch (e) {
      add('error: ' + String(e));
    }
  };

  return (
    <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h1 style={{ fontSize: '22px' }}>Push စမ်းသပ်</h1>
      <button className="lk-button" onClick={start}>
        Notification ခွင့်ပြုပြီး token ယူမယ်
      </button>
      {token && (
        <textarea
          readOnly
          value={token}
          rows={6}
          style={{ padding: '8px', background: '#111', color: '#fff', fontSize: '12px' }}
        />
      )}
      <div style={{ fontSize: '14px' }}>
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </main>
  );
}
