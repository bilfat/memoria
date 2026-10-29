import type { Metadata } from 'next';
import { Ballet, Bodoni_Moda, DM_Sans } from 'next/font/google';
import './globals.css';

const ballet = Ballet({
  variable: '--font-ballet',
  subsets: ['latin'],
  display: 'swap',
});

const bodoni = Bodoni_Moda({
  variable: '--font-bodoni',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MEMORIA — Velvet Night | Diesnatalis SIKC 2026',
  description:
    'Satu malam istimewa perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan — Velvet Night / A Night to Remember.',
  keywords: ['MEMORIA', 'Diesnatalis SIKC 2026', 'Velvet Night', 'Telkom University', 'SIKC'],
  icons: {
    icon: '/favicon.ico',
  },
};

import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${ballet.variable} ${bodoni.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-memoria-burgundy selection:text-memoria-ivory">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
