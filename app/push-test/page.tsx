'use client';
import React from 'react';

export default function PushTestPage() {
  const [log, setLog] = React.useState<string[]>([]);
  const [token, setToken] = React.useState('');
  const add = (m: string) => setLog((l) => [...l, m]);

  const start = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await push.addListener('registration', (t: any) => {
        setToken(t.value);
        add('token ရပါပြီ');
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await push.addListener('registrationError', (e: any) => add('error: ' + JSON.stringify(e)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await push.addListener('pushNotificationReceived', (n: any) =>
        add('လက်ခံရပါပြီ: ' + JSON.stringify(n)),
      );
      const perm = await push.requestPermissions();
      add('permission: ' + perm.receive);
      if (perm.receive !== 'granted') return;
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
