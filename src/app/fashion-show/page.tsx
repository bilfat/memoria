'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { FashionEditorialHero } from '@/components/public/fashion-page/FashionEditorialHero';
import { FashionHallOfFameHeader } from '@/components/public/fashion-page/FashionHallOfFameHeader';
import { FashionWinnersGrid } from '@/components/public/fashion-page/FashionWinnersGrid';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { INITIAL_EVENT_CONTENT, INITIAL_WINNERS } from '@/data/mock/seeds';
import { EventContent, WinnerAnnouncement } from '@/types';

/**
 * FashionShowPage
 * MEMORIA — The Velvet Runway Gallery — Luxury Fashion Editorial Experience
 * - Background utama terang: White (#FFFFFF) & Warm Ivory (#FFFDF8) dengan aksen beludru merah (#891523) dan antique gold (#D6B46A)
 * - Hero editorial asimetris dua kolom dengan ilustrasi 3D runway catwalk berlapis
 * - Galeri Hall of Fame pemenang Fashion Show dinamis dari Admin Panitia
 * - Grid adaptif terpusat otomatis jika 1 atau 2 pemenang
 * - Moving runway spotlight sweep & soft contact shadow
 */
export default function FashionShowPage() {
  // Inisialisasi state awal dengan seed SSR yang stabil untuk mencegah hydration mismatch
  const [event, setEvent] = useState<EventContent>(INITIAL_EVENT_CONTENT);
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(() =>
    INITIAL_WINNERS.filter(
      (w) => w.section === 'FASHION_SHOW' && w.status === 'PUBLISHED'
    )
  );

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listPublishedWinners('FASHION_SHOW').then(setWinners);

    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setWinners(mockStore.getPublishedWinners('FASHION_SHOW'));
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell
      className="bg-[#FFFFFF] text-[#3E2418] selection:bg-[#891523]/20 selection:text-[#3E2418] overflow-x-hidden min-h-screen"
    >
      <div className="relative py-8 sm:py-14 md:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh] overflow-hidden">
        
        {/* 1. Subtle Editorial Diagonal Background Mesh */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #891523 0, #891523 1px, transparent 0, transparent 40px)',
          }}
        />

        {/* 2. Soft Velvet Crimson & Champagne Overhead Atmospheric Washes */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-1/4 w-3/4 max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(137,21,35,0.08)_0%,_rgba(214,180,106,0.08)_40%,_transparent_75%)] blur-3xl pointer-events-none"
        />

        {/* 3. Hero — The Runway Entrance (Asymmetric Editorial Layout) */}
        <FashionEditorialHero
          title={event.fashionTeaser?.title}
          description={event.fashionTeaser?.description}
        />

        {/* 4. Section Divider Line */}
        <div className="w-full max-w-5xl mx-auto my-10 sm:my-16 h-[1px] bg-gradient-to-r from-transparent via-[#891523]/25 to-transparent" />

        {/* 5. Fashion Hall of Fame Section */}
        <section className="relative z-10 w-full mb-16 sm:mb-24">
          <FashionHallOfFameHeader />
          <FashionWinnersGrid winners={winners} />
        </section>

      </div>
    </PublicLayoutShell>
  );
}
