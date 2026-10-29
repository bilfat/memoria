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
 * Golden Hall of Fame — Winner Photography Presentation
 * - Foto adalah fokus utama galeri
 * - Mendukung transparan PNG/WebP (object-fit: contain + drop-shadow panggung)
 * - Mendukung foto biasa berlatar belakang (object-fit: cover + rounded-2xl + subtle ring)
 * - Overhead gallery spotlight dari atas foto
 * - Golden glow lantai galeri di bawah foto
 * - Tanpa background box berat atau bingkai tebal yang mengaburkan subjek
 */
export function AwardWinnerPhoto({ photoUrl, winnerName, categoryName }: AwardWinnerPhotoProps) {
  // Cek apakah aset berupa file transparan (.png atau .webp)
  const isTransparent = Boolean(
    photoUrl && (photoUrl.endsWith('.png') || photoUrl.endsWith('.webp'))
  );

  return (
    <div className="relative w-full pt-4">
      {/* 1. Floor Gold Glow Underneath Photo */}
      <GoldGlowBase />

      {/* 2. Photo Stage Container: Menyatu anggun dengan background galeri */}
      <div className="award-winner-photo-frame relative w-full aspect-[4/5] min-h-[380px] sm:min-h-[420px] rounded-2xl flex items-end justify-center transition-all duration-700 ease-out group-hover:-translate-y-2 z-10">
        
        {/* Overhead Gallery Ceiling Spotlight Fixture & Cone Light Beam */}
        <SpotlightOverlay />

        {photoUrl ? (
          isTransparent ? (
            /* A. Transparent PNG / Silhouette Photography */
            <div className="relative w-full h-full flex items-end justify-center p-3 sm:p-5 z-10">
              <img
                src={photoUrl}
                alt={`${winnerName} - ${categoryName}`}
                className="w-full h-full max-h-[94%] object-contain object-bottom drop-shadow-[0_16px_32px_rgba(166,123,57,0.35)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          ) : (
            /* B. Regular Photography with Environment Background */
            <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-[#D6B46A]/35 shadow-[0_12px_28px_rgba(166,123,57,0.18)] z-10 transition-all duration-700 group-hover:shadow-[0_20px_42px_rgba(214,180,106,0.32)]">
              <img
                src={photoUrl}
                alt={`${winnerName} - ${categoryName}`}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Subtle Inner Ring Highlight */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-[#FFFFFF]/45"
              />
            </div>
          )
        ) : (
          /* C. Elegant Neutral Fallback Crest */
          <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EB] to-[#F3EADA] border border-[#D6B46A]/30 shadow-[0_10px_25px_rgba(214,180,106,0.12)] relative overflow-hidden select-none z-10">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFFDF9] to-[#F3E8D2] border border-[#D6B46A]/50 shadow-[0_6px_20px_rgba(214,180,106,0.2)] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                <Trophy size={36} weight="fill" className="text-[#A67B39]" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-[0.2em] text-[#A67B39] uppercase font-semibold">
                <Sparkle size={12} weight="fill" className="text-[#D6B46A]" />
                <span>MEMORIA HONORS</span>
              </div>
              <p className="text-xs text-[#7B6050] mt-1 max-w-[200px]">
                Dokumentasi Penerima Anugerah
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
