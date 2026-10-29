'use client';

import React from 'react';
import { CoatHanger, Sparkle } from '@phosphor-icons/react';

/**
 * FashionEmptyState
 * Tampilan Anggun & Bersih saat belum ada pemenang Fashion Show yang dipublikasikan:
 * - "Panggung Fashion Show Segera Hadir"
 * - "Pemenang dan penampil Fashion Show akan diumumkan saat malam puncak MEMORIA berlangsung."
 */
export function FashionEmptyState() {
  return (
    <div className="w-full max-w-xl mx-auto py-16 px-6 text-center select-none relative z-10">
      {/* Minimalist Velvet Crest */}
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EB] to-[#F1E8D8] border border-[#891523]/35 shadow-[0_10px_25px_rgba(137,21,35,0.12)] flex items-center justify-center mb-6">
        <CoatHanger size={36} className="text-[#891523]" />
        <div className="absolute -top-1.5 -right-1.5">
          <Sparkle size={18} weight="fill" className="text-[#D6B46A] animate-pulse" />
        </div>
      </div>

      {/* Heading: Bodoni Moda */}
      <h3
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="text-2xl sm:text-3xl font-bold text-[#3E2418] mb-3 tracking-tight"
      >
        Panggung Fashion Show Segera Hadir
      </h3>

      {/* Decorative Velvet Line Divider */}
      <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#891523] to-transparent mx-auto my-4" />

      {/* Description: DM Sans */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-sm sm:text-base text-[#7B6050] font-normal leading-relaxed max-w-md mx-auto"
      >
        Penampil dan pemenang Fashion Show akan diumumkan saat malam puncak MEMORIA berlangsung. Kurasi busana terbaik sedang dipersiapkan untuk pertunjukan peragaan busana.
      </p>
    </div>
  );
}
