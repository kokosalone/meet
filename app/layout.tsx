import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'သမိုင်းမိသားစု',
    template: '%s',
  },
  description: 'သမိုင်းမိသားစု video call',
  appleWebApp: {
    capable: true,
    title: 'သမိုင်းမိသားစု',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/apple-icon.png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-lk-theme="default">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
