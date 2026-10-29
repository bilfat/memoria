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
 * Golden Hall of Fame — Responsive Winners Gallery Grid
 * - 3 Kolom di Desktop (lg:grid-cols-3), 2 di Tablet (md:grid-cols-2), 1 di Mobile (grid-cols-1)
 * - Penataan seimbang & terpusat otomatis bila jumlah pemenang 1 atau 2 orang (tidak tersudut sendirian di kiri)
 * - GSAP Animation Storyboard:
 *   Scene B: Spotlight Activation (ceiling spotlight & beam illuminate)
 *   Scene C: Winner Photo Reveal (y: 25 -> 0, scale: 0.96 -> 1, opacity: 0 -> 1, gold glow emerges)
 *   Scene D: Winner Info Reveal (category, name, description staggered fade-up)
 *   Scene E: Idle state stable
 *   Scene F: Hover smooth lift (handled via CSS transition)
 */
export function AwardingWinnersGrid({ winners }: AwardingWinnersGridProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridContainerRef.current || winners.length === 0) return;

      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set(
          [
            '.award-winner-item',
            '.award-spotlight-beam',
            '.award-gold-glow',
            '.award-winner-photo-frame',
            '.award-winner-category',
            '.award-winner-name',
            '.award-winner-desc',
          ],
          { opacity: 1, y: 0, scale: 1 }
        );
        return;
      }

      // Bersihkan tween sebelumnya jika data winners berganti
      gsap.killTweensOf([
        '.award-winner-item',
        '.award-spotlight-beam',
        '.award-gold-glow',
        '.award-winner-photo-frame',
        '.award-winner-category',
        '.award-winner-name',
        '.award-winner-desc',
      ]);

      // Set initial states
      gsap.set('.award-winner-item', { opacity: 1 });
      gsap.set('.award-spotlight-beam', { opacity: 0, scaleY: 0.85, transformOrigin: 'top center' });
      gsap.set('.award-gold-glow', { opacity: 0, scale: 0.8 });
      gsap.set('.award-winner-photo-frame', { opacity: 0, y: 28, scale: 0.96 });
      gsap.set('.award-winner-category', { opacity: 0, y: 14 });
      gsap.set('.award-winner-name', { opacity: 0, y: 16 });
      gsap.set('.award-winner-desc', { opacity: 0, y: 18 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Scene B: Overhead Spotlight & Beam Activation
      tl.to('.award-spotlight-beam', {
        opacity: 0.85,
        scaleY: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
      })
        // Scene C: Winner Photo Reveal + Floor Gold Glow
        .to(
          '.award-winner-photo-frame',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .to(
          '.award-gold-glow',
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'back.out(1.5)',
          },
          '-=0.7'
        )
        // Scene D: Winner Information Reveal (Category, Name, Description)
        .to(
          '.award-winner-category',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.5'
        )
        .to(
          '.award-winner-name',
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
          },
          '-=0.5'
        )
        .to(
          '.award-winner-desc',
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
          },
          '-=0.5'
        );
    },
    { dependencies: [winners.length], scope: gridContainerRef }
  );

  if (winners.length === 0) {
    return <AwardingEmptyState />;
  }

  // Pengaturan Layout Dinamis:
  // - 1 Pemenang: Terpusat di tengah container (max-w-md mx-auto)
  // - 2 Pemenang: Grid 2 kolom seimbang terpusat (max-w-3xl mx-auto)
  // - 3+ Pemenang: Grid standar 3 kolom desktop (max-w-7xl mx-auto)
  const isSingle = winners.length === 1;
  const isDouble = winners.length === 2;

  let layoutClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 lg:gap-x-12 lg:gap-y-20 max-w-7xl mx-auto';
  if (isSingle) {
    layoutClass = 'flex justify-center max-w-md mx-auto';
  } else if (isDouble) {
    layoutClass = 'grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 sm:gap-x-12 max-w-3xl mx-auto';
  }

  return (
    <div ref={gridContainerRef} className={layoutClass}>
      {winners.map((winner) => (
        <div key={winner.id} className="w-full flex justify-center">
          <AwardWinnerCard winner={winner} />
        </div>
      ))}
    </div>
  );
}
