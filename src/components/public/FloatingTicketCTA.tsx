'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket } from '@phosphor-icons/react';
import { ticketAdapter } from '@/data/adapters';
import { TicketType } from '@/types';

export function FloatingTicketCTA() {
  const [hasPublishedTicket, setHasPublishedTicket] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    ticketAdapter.listPublishedTickets().then((tickets: TicketType[]) => {
      if (mounted) {
        setHasPublishedTicket(tickets.length > 0);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!hasPublishedTicket) return null;

  return (
    <div
      className="fixed right-4 md:right-8 z-50 transition-all duration-300"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <Link
        href="/daftar"
        id="btn-floating-ticket"
        className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red text-memoria-ivory font-semibold text-sm shadow-[0_8px_25px_rgba(137,21,35,0.6)] border border-memoria-gold/70 hover:border-memoria-gold hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-memoria-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-memoria-gold"></span>
        </span>
        <Ticket size={22} weight="fill" className="text-memoria-champagne group-hover:rotate-12 transition-transform duration-300" />
        <span className="tracking-wide">Tiket Gratis</span>
        <span className="hidden sm:inline text-xs text-memoria-champagne/80 font-normal">
          Daftar Sekarang
        </span>
      </Link>
    </div>
  );
}
