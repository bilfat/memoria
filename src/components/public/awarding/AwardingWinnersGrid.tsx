'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { WinnerAnnouncement } from '@/types';
import { AwardWinnerCard } from './AwardWinnerCard';
import { AwardingEmptyState } from './AwardingEmptyState';

interface AwardingWinnersGridProps {
  winners: WinnerAnnouncement[];
}

/**
 * AwardingWinnersGrid
 * Grid responsive untuk White Elegant Awards Gallery:
 * - Desktop: 3 kolom per baris (lg:grid-cols-3)
 * - Tablet: 2 kolom (md:grid-cols-2)
 * - Mobile: 1 kolom (grid-cols-1)
 * Dilengkapi animasi staggered entrance yang anggun saat memasuki viewport.
 */
export function AwardingWinnersGrid({ winners }: AwardingWinnersGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current || winners.length === 0) return;

      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set('.award-winner-item', { opacity: 1, y: 0, scale: 1 });
        return;
      }

      // Bersihkan animasi lama sebelum memulai yang baru
      gsap.killTweensOf('.award-winner-item');

      // Animasi masuk halus staggered
      gsap.fromTo(
        '.award-winner-item',
        {
          opacity: 0,
          y: 24,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    },
    { dependencies: [winners.length], scope: gridRef }
  );

  if (winners.length === 0) {
    return <AwardingEmptyState />;
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-10 sm:gap-y-14 lg:gap-x-12 lg:gap-y-16"
    >
      {winners.map((winner) => (
        <AwardWinnerCard key={winner.id} winner={winner} />
      ))}
    </div>
  );
}
