'use client';

import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { FloatingTicketCTA } from './FloatingTicketCTA';
import { ToastProvider } from '../ui/Toast';
import { TheatricalLightRaysBackground } from './TheatricalLightRaysBackground';

export function PublicLayoutShell({
  children,
  className = 'bg-memoria-midnight text-memoria-ivory',
  showLightRays = false,
}: {
  children: React.ReactNode;
  className?: string;
  showLightRays?: boolean;
}) {
  return (
    <ToastProvider>
      <div className={`relative min-h-screen flex flex-col ${className}`}>
        {showLightRays && <TheatricalLightRaysBackground />}
        <PublicNavbar />
        <main className="relative z-10 flex-1">{children}</main>
        <PublicFooter />
        <FloatingTicketCTA />
      </div>
    </ToastProvider>
  );
}
