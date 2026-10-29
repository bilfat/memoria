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
 * Golden Hall of Fame — Winner Card Presentation
 * - Foto pemenang dominan sebagai pusat perhatian
 * - Kategori: DM Sans uppercase Deep Gold (#A67B39)
 * - Nama Pemenang: Bodoni Moda Dark Brown (#3E2418)
 * - Deskripsi: DM Sans Secondary Brown (#7B6050)
 * - Tanpa panel atau kartu tebal di belakang foto
 */
export function AwardWinnerCard({ winner }: AwardWinnerCardProps) {
  return (
    <article className="group flex flex-col w-full text-left select-none award-winner-item transition-all duration-500">
      {/* 1. FOTO PEMENANG DENGAN OVERHEAD SPOTLIGHT & GOLD FLOOR GLOW */}
      <AwardWinnerPhoto
        photoUrl={winner.winnerPhoto}
        winnerName={winner.winnerName}
        categoryName={winner.categoryName}
      />

      {/* 2. KONTEN TIPOGRAFI DI BAWAH FOTO */}
      <div className="mt-6 sm:mt-7 flex flex-col gap-2 px-1">
        {/* Kategori Penghargaan */}
        <div className="award-winner-category flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#A67B39]">
          <Sparkle size={13} weight="fill" className="text-[#D6B46A] shrink-0" />
          <span
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="truncate"
          >
            {winner.categoryName}
          </span>
        </div>

        {/* Nama Pemenang (Fokus Teks Terbesar) */}
        <h3
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="award-winner-name text-2xl sm:text-[1.75rem] font-bold text-[#3E2418] tracking-tight leading-snug transition-colors duration-300 group-hover:text-[#891523] break-words"
        >
          {winner.winnerName}
        </h3>

        {/* Deskripsi / Keterangan Singkat */}
        {winner.winnerDescription && (
          <p
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="award-winner-desc text-sm sm:text-[15px] text-[#7B6050] font-normal leading-relaxed line-clamp-3 sm:line-clamp-4 mt-0.5"
          >
            {winner.winnerDescription}
          </p>
        )}
      </div>
    </article>
  );
}
