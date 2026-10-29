'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { WinnerAnnouncement } from '@/types';
import { FashionWinnerCard } from './FashionWinnerCard';
import { FashionEmptyState } from './FashionEmptyState';

interface FashionWinnersGridProps {
  winners: WinnerAnnouncement[];
}

/**
 * FashionWinnersGrid
 * Grid Responsif & Adaptif untuk Galeri Pemenang/Penampil Fashion Show:
 * - 4 Kolom di Desktop (lg:grid-cols-4 / 1 baris 4 orang), 2 di Tablet (sm:grid-cols-2), 1 di Mobile (grid-cols-1)
 * - Auto Centering / Penataan Seimbang bila hanya ada 1, 2, atau 3 penampil
 * - GSAP Entrance Animation:
 *   Scene B: Photo vertical reveal (y: 28 -> 0, scale: 0.97 -> 1)
 *   Scene C: Spotlight sweep & soft contact shadow
 *   Scene D: Category, Name, Description staggered fade-up
 */
export function FashionWinnersGrid({ winners }: FashionWinnersGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || winners.length === 0) return;

      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set(
          [
            '.fashion-winner-item',
            '.fashion-photo-frame',
            '.fashion-spotlight-beam',
            '.fashion-winner-cat',
            '.fashion-winner-name',
            '.fashion-winner-desc',
          ],
          { opacity: 1, y: 0, scale: 1 }
        );
        return;
      }

      gsap.killTweensOf([
        '.fashion-winner-item',
        '.fashion-photo-frame',
        '.fashion-spotlight-beam',
        '.fashion-winner-cat',
        '.fashion-winner-name',
        '.fashion-winner-desc',
      ]);

      // Initial States
      gsap.set('.fashion-winner-item', { opacity: 1 });
      gsap.set('.fashion-photo-frame', { opacity: 0, y: 28, scale: 0.97 });
      gsap.set('.fashion-spotlight-beam', { opacity: 0, scaleY: 0.85, transformOrigin: 'top center' });
      gsap.set('.fashion-winner-cat', { opacity: 0, y: 12 });
      gsap.set('.fashion-winner-name', { opacity: 0, y: 15 });
      gsap.set('.fashion-winner-desc', { opacity: 0, y: 18 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Scene B: Runway Spotlight Sweep & Photo Reveal
      tl.to('.fashion-spotlight-beam', {
        opacity: 0.85,
        scaleY: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out',
      })
        .to(
          '.fashion-photo-frame',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        // Scene D: Editorial Typography Reveal
        .to(
          '.fashion-winner-cat',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
          },
          '-=0.5'
        )
        .to(
          '.fashion-winner-name',
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
          },
          '-=0.5'
        )
        .to(
          '.fashion-winner-desc',
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
          },
          '-=0.5'
        );
    },
    { dependencies: [winners.length], scope: containerRef }
  );

  if (winners.length === 0) {
    return <FashionEmptyState />;
  }

  // Adaptive Grid Configuration (1 Baris = 4 Orang di Desktop):
  // - 1 Pemenang: Terpusat di tengah layar (max-w-xs sm:max-w-sm mx-auto)
  // - 2 Pemenang: Terpusat dalam 2 kolom (max-w-2xl mx-auto)
  // - 3 Pemenang: Terpusat dalam 3 kolom (max-w-4xl mx-auto)
  // - 4+ Pemenang: Grid 4 kolom per baris di Desktop (lg:grid-cols-4 max-w-7xl mx-auto)
  const count = winners.length;

  let layoutClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 max-w-7xl mx-auto';
  if (count === 1) {
    layoutClass = 'flex justify-center max-w-xs sm:max-w-sm mx-auto';
  } else if (count === 2) {
    layoutClass = 'grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto';
  } else if (count === 3) {
    layoutClass = 'grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7 max-w-4xl mx-auto';
  }

  return (
    <div ref={containerRef} className={layoutClass}>
      {winners.map((winner) => (
        <div key={winner.id} className="w-full flex justify-center">
          <FashionWinnerCard winner={winner} />
        </div>
      ))}
    </div>
  );
}
