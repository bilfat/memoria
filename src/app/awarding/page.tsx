'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { AwardingPageHero } from '@/components/public/awarding/AwardingPageHero';
import { AwardingWinnersGrid } from '@/components/public/awarding/AwardingWinnersGrid';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { EventContent, WinnerAnnouncement } from '@/types';

/**
 * AwardingPage (White Elegant Awards Gallery)
 * Menampilkan galeri penerima anugerah kehormatan MEMORIA:
 * - Latar belakang putih bersih, mewah, dan lapang (#FFFFFF)
 * - Grid responsive: 3 kolom per baris di desktop, 2 di tablet, 1 di mobile
 * - Foto pemenang tampil dominan dengan rasio konsisten (rounded-2xl)
 * - Pencahayaan lampu gallery spotlight dari atas foto
 * - Pendaran cahaya / shadow emas (gold glow) di bawah foto
 * - Tanpa kartu tebal atau background panel tambahan di belakang foto
 * - Mengambil data dinamis yang dipublikasikan oleh Admin Panitia
 */
export default function AwardingPage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(
    mockStore.getPublishedWinners('AWARDING')
  );

  useEffect(() => {
    // Ambil data awal dari adapter
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listPublishedWinners('AWARDING').then(setWinners);

    // Subscribe ke mutasi real-time mock store (ketika admin publish/edit/tambah)
    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setWinners(mockStore.getPublishedWinners('AWARDING'));
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell
      className="bg-[#FFFFFF] text-[#2B1A12] selection:bg-[#D6B46A]/30 selection:text-[#2B1A12] overflow-x-hidden"
    >
      <div className="relative py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[75vh] overflow-hidden">
        {/* Gallery Overhead Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-80 bg-[radial-gradient(ellipse_at_top,_rgba(214,180,106,0.14)_0%,_rgba(245,216,144,0.06)_45%,_transparent_75%)] blur-3xl pointer-events-none"
        />

        {/* 1. White Elegant Header / Hero */}
        <AwardingPageHero
          title={event.awardingTeaser?.title}
          description={event.awardingTeaser?.description}
        />

        {/* 2. Published Winners Gallery Grid (3 Kolom Desktop, 2 Tablet, 1 Mobile) */}
        <div className="relative z-10">
          <AwardingWinnersGrid winners={winners} />
        </div>
      </div>
    </PublicLayoutShell>
  );
}
