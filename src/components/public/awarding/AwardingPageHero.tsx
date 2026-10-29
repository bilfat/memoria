'use client';

import React from 'react';
import { Sparkle } from '@phosphor-icons/react';

interface AwardingPageHeroProps {
  title?: string;
  description?: string;
}

/**
 * AwardingPageHero
 * Header elegan, bersih, dan lapang berlatar putih/ivory untuk halaman /awarding.
 * Center aligned dengan tipografi Bodoni Moda & DM Sans, ornamen garis emas minimal.
 */
export function AwardingPageHero({ title, description }: AwardingPageHeroProps) {
  const displayTitle = title || 'The Golden Moment Awarding';
  const displayDesc =
    description ||
    'Galeri kehormatan resmi para penerima anugerah Diesnatalis SIKC atas dedikasi luar biasa, inovasi teknologi unggul, dan kepemimpinan inspiratif.';

  return (
    <header className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 select-none">
      {/* 1. Small Label Badge with Soft Gold Border */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EC] border border-[#D6B46A]/50 text-[#8B6E32] text-xs font-mono tracking-[0.25em] uppercase mb-5 shadow-xs">
        <Sparkle size={13} weight="fill" className="text-[#D6B46A]" />
        <span>THE GOLDEN MOMENT</span>
      </div>

      {/* 2. Main Grand Heading (Bodoni Moda) */}
      <h1
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="text-[1.85rem] xs:text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#2B1A12] mb-5 leading-[1.18] break-words"
      >
        {displayTitle}
      </h1>

      {/* 3. Minimalist Gold Line Divider */}
      <div className="w-36 h-[1.5px] mx-auto my-5 relative flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#D6B46A] to-transparent" />
        <div className="absolute w-2 h-2 rotate-45 bg-[#D6B46A] shadow-[0_0_6px_rgba(214,180,106,0.8)]" />
      </div>

      {/* 4. Short Editorial Description (DM Sans) */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-base sm:text-lg text-[#6E5A4D] font-normal leading-relaxed max-w-2xl mx-auto px-2"
      >
        {displayDesc}
      </p>
    </header>
  );
}
