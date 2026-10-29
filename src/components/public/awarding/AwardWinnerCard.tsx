'use client';

import React from 'react';
import { Sparkle } from '@phosphor-icons/react';
import { WinnerAnnouncement } from '@/types';
import { AwardWinnerPhoto } from './AwardWinnerPhoto';

interface AwardWinnerCardProps {
  winner: WinnerAnnouncement;
}

/**
 * AwardWinnerCard
 * Struktur item pemenang individu:
 * 1. Foto pemenang (dominan dengan spotlight atas dan gold glow bawah)
 * 2. Kategori kecil dengan aksen emas
 * 3. Nama pemenang besar (Bodoni Moda)
 * 4. Keterangan / deskripsi singkat (DM Sans)
 * Tanpa kartu tebal atau background panel tambahan.
 */
export function AwardWinnerCard({ winner }: AwardWinnerCardProps) {
  return (
    <article className="group flex flex-col w-full text-left select-none award-winner-item">
      {/* 1. FOTO PEMENANG (DOMINAN) */}
      <AwardWinnerPhoto
        photoUrl={winner.winnerPhoto}
        winnerName={winner.winnerName}
        categoryName={winner.categoryName}
      />

      {/* 2. KONTEN TEKS DI BAWAH FOTO */}
      <div className="mt-5 sm:mt-6 flex flex-col gap-2">
        {/* Kategori Kecil */}
        <div className="flex items-center gap-1.5 text-xs font-mono tracking-[0.18em] uppercase text-[#8B6E32] font-semibold">
          <Sparkle size={12} weight="fill" className="text-[#D6B46A] shrink-0" />
          <span className="truncate">{winner.categoryName}</span>
        </div>

        {/* Nama Pemenang Besar */}
        <h3
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="text-2xl sm:text-[1.65rem] font-bold text-[#2B1A12] tracking-tight leading-snug transition-colors duration-300 group-hover:text-[#891523] break-words"
        >
          {winner.winnerName}
        </h3>

        {/* Deskripsi Singkat */}
        {winner.winnerDescription && (
          <p
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="text-sm text-[#6E5A4D] font-normal leading-relaxed line-clamp-3 sm:line-clamp-4 mt-1"
          >
            {winner.winnerDescription}
          </p>
        )}
      </div>
    </article>
  );
}
