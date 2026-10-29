'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { AwardingPageHero } from '@/components/public/awarding/AwardingPageHero';
import { AwardingWinnersGrid } from '@/components/public/awarding/AwardingWinnersGrid';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { INITIAL_EVENT_CONTENT, INITIAL_WINNERS } from '@/data/mock/seeds';
import { EventContent, WinnerAnnouncement } from '@/types';

/**
 * AwardingPage
 * MEMORIA — Golden Hall of Fame — Bright Luxury Winners Gallery
 * - Background utama terang: perpaduan White (#FFFFFF) & Warm Ivory (#FFFDF8)
 * - Tipografi: Bodoni Moda (Heading/Nama) & DM Sans (Label/Kategori/Deskripsi)
 * - Warna: Main Text (#3E2418), Secondary (#7B6050), Deep Gold (#A67B39), Antique Gold (#D6B46A), Velvet Accent (#891523)
 * - Overhead gallery ceiling spotlight fixture dengan berkas sinar kerucut emas lembut
 * - Pendaran cahaya (golden glow) elips di bawah setiap foto pemenang
 * - Grid responsif: 3 kolom di desktop, 2 di tablet, 1 di mobile
 * - Layout seimbang & terpusat otomatis saat 1 atau 2 pemenang
 * - Sinkronisasi real-time dengan data Published dari Admin Panitia
 */
export default function AwardingPage() {
  const [event, setEvent] = useState<EventContent>(INITIAL_EVENT_CONTENT);
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(() =>
    INITIAL_WINNERS.filter(
      (w) => w.section === 'AWARDING' && w.status === 'PUBLISHED'
    )
  );

  useEffect(() => {
    // Ambil data awal dari adapter
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listPublishedWinners('AWARDING').then(setWinners);

    // Subscribe ke mutasi real-time mock store (ketika admin publish/edit/tambah pemenang)
    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setWinners(mockStore.getPublishedWinners('AWARDING'));
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell
      className="bg-[#FFFFFF] text-[#3E2418] selection:bg-[#D6B46A]/25 selection:text-[#3E2418] overflow-x-hidden min-h-screen"
    >
      <div className="relative py-12 sm:py-18 md:py-22 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh] overflow-hidden">
        {/* 1. Golden Hall Overhead Ambient Light Washes */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(234,207,164,0.22)_0%,_rgba(214,180,106,0.12)_35%,_rgba(255,253,248,0.05)_65%,_transparent_80%)] blur-3xl pointer-events-none"
        />

        {/* 2. Soft Ivory Floor Wash */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(255,253,248,0.85)_0%,_transparent_100%)] pointer-events-none"
        />

        {/* 3. Golden Hall of Fame Header Section */}
        <AwardingPageHero
          title={event.awardingTeaser?.title}
          description={event.awardingTeaser?.description}
        />

        {/* 4. Published Winners Gallery Grid */}
        <main className="relative z-10 w-full mb-16 sm:mb-24">
          <AwardingWinnersGrid winners={winners} />
        </main>
      </div>
    </PublicLayoutShell>
  );
}
