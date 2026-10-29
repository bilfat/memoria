'use client';

import React from 'react';
import { Trophy, Sparkle } from '@phosphor-icons/react';

/**
 * AwardingEmptyState
 * Golden Hall of Fame — Empty State
 * Tampilan anggun, minimalis, dan lapang berlatar putih-ivory saat belum ada pemenang yang dipublikasikan.
 */
export function AwardingEmptyState() {
  return (
    <div className="w-full max-w-xl mx-auto py-20 px-6 text-center select-none relative z-10">
      {/* Minimalist Champagne Gold Crest */}
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EB] to-[#F3EADA] border border-[#D6B46A]/50 shadow-[0_10px_25px_rgba(214,180,106,0.18)] flex items-center justify-center mb-6">
        <Trophy size={36} weight="fill" className="text-[#A67B39]" />
        <div className="absolute -top-1.5 -right-1.5">
          <Sparkle size={18} weight="fill" className="text-[#D6B46A] animate-pulse" />
        </div>
      </div>

      {/* Heading */}
      <h3
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="text-2xl sm:text-3xl font-bold text-[#3E2418] mb-3 tracking-tight"
      >
        Pemenang Akan Diumumkan Segera
      </h3>

      {/* Decorative Gold Divider */}
      <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#D6B46A] to-transparent mx-auto my-4" />

      {/* Description */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-sm sm:text-base text-[#7B6050] font-normal leading-relaxed max-w-md mx-auto"
      >
        Daftar penerima anugerah kehormatan MEMORIA sedang dalam proses kurasi dewan kehormatan dan akan dipublikasikan secara resmi pada malam puncak penganugerahan.
      </p>
    </div>
  );
}
