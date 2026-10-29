'use client';

import React from 'react';
import { Trophy, Sparkle } from '@phosphor-icons/react';
import { SpotlightOverlay } from './SpotlightOverlay';
import { GoldGlowBase } from './GoldGlowBase';

interface AwardWinnerPhotoProps {
  photoUrl?: string;
  winnerName: string;
  categoryName: string;
}

/**
 * AwardWinnerPhoto
 * Menampilkan foto pemenang sebagai elemen utama galeri dengan rasio portrait konsisten,
 * sudut membulat elegan (rounded-2xl), spotlight lembut dari atas,
 * dan gold glow pendaran cahaya di bawah foto.
 */
export function AwardWinnerPhoto({ photoUrl, winnerName, categoryName }: AwardWinnerPhotoProps) {
  return (
    <div className="relative w-full">
      {/* 1. Gold Glow Base di Bawah Foto */}
      <GoldGlowBase />

      {/* 2. Photo Framing Container */}
      <div className="relative w-full aspect-[4/5] min-h-[360px] sm:min-h-[400px] rounded-2xl overflow-hidden bg-[#FAF6EE] ring-1 ring-[#D6B46A]/30 shadow-[0_10px_25px_rgba(214,180,106,0.18),0_4px_10px_rgba(43,26,18,0.04)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_35px_rgba(214,180,106,0.28),0_6px_14px_rgba(43,26,18,0.08)] group-hover:ring-[#D6B46A]/60 z-10">
        
        {/* 3. Photo Image or Elegant Neutral Gallery Placeholder */}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${winnerName} - ${categoryName}`}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#FDFBF7] via-[#F7F2E7] to-[#EFE7D5] relative overflow-hidden select-none">
            {/* Subtle background ambient ring */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(214,180,106,0.15)_0%,_transparent_65%)]" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Minimalist Gold Monogram Medal */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFFDF9] to-[#F3E8D2] border border-[#D6B46A]/50 shadow-[0_6px_20px_rgba(214,180,106,0.2)] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                <Trophy size={36} weight="fill" className="text-[#C8A252]" />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-[0.2em] text-[#8B6E32] uppercase font-semibold">
                <Sparkle size={12} weight="fill" className="text-[#D6B46A]" />
                <span>MEMORIA HONORS</span>
              </div>
              <p className="text-xs text-[#8A7463] mt-1 max-w-[200px]">
                Dokumentasi Penghargaan Kehormatan
              </p>
            </div>
          </div>
        )}

        {/* 4. Gallery Spotlight Overlay (Cahaya Sorot dari Atas) */}
        <SpotlightOverlay />

        {/* 5. Minimalist Frame Inner Vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(214,180,106,0.12)] z-15"
        />
      </div>
    </div>
  );
}

