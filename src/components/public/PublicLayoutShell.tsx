'use client';

import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { FloatingTicketCTA } from './FloatingTicketCTA';
import { ToastProvider } from '../ui/Toast';

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-memoria-midnight text-memoria-ivory">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <FloatingTicketCTA />
      </div>
    </ToastProvider>
  );
}
