'use client';

import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { FloatingTicketCTA } from './FloatingTicketCTA';
import { ToastProvider } from '../ui/Toast';

export function PublicLayoutShell({
  children,
  className = 'bg-memoria-midnight text-memoria-ivory',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ToastProvider>
      <div className={`min-h-screen flex flex-col ${className}`}>
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <FloatingTicketCTA />
      </div>
    </ToastProvider>
  );
}
