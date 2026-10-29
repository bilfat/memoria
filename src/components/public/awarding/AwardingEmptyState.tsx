'use client';

import React from 'react';
import { Trophy, Sparkle } from '@phosphor-icons/react';

/**
 * AwardingEmptyState
 * Tampilan minimalis, bersih, dan elegan saat belum ada pemenang yang dipublikasikan.
 * Mengikuti konsep White Elegant Awards Gallery.
 */
export function AwardingEmptyState() {
  return (
    <div className="w-full max-w-xl mx-auto py-20 px-6 text-center select-none">
      {/* Delicate Gold Trophy Crest */}
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] border border-[#D6B46A]/40 shadow-[0_8px_25px_rgba(214,180,106,0.2)] flex items-center justify-center mb-6">
        <Trophy size={36} weight="fill" className="text-[#C8A252]" />
        <div className="absolute -top-1 -right-1">
          <Sparkle size={16} weight="fill" className="text-[#D6B46A] animate-pulse" />
        </div>
      </div>

      {/* Heading */}
      <h3
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="text-2xl sm:text-3xl font-bold text-[#2B1A12] mb-3 tracking-tight"
      >
        Pemenang Akan Diumumkan Segera
      </h3>

      {/* Decorative Gold Divider */}
      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D6B46A] to-transparent mx-auto my-3" />

      {/* Description */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-sm sm:text-base text-[#6E5A4D] font-normal leading-relaxed max-w-md mx-auto"
      >
        Daftar penerima anugerah kehormatan MEMORIA sedang dalam proses kurasi dewan kehormatan dan akan dipublikasikan secara resmi pada malam puncak penganugerahan.
      </p>
    </div>
  );
}

