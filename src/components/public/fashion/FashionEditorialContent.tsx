'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';

interface FashionEditorialContentProps {
  title?: string;
  description?: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function FashionEditorialContent({
  title = 'The Runway Experience',
  description = 'Koleksi busana tematik Diesnatalis dari para desainer muda berbakat, menghadirkan estetika velvet crimson dan kreasi haute couture spektakuler di atas panggung catwalk.',
  contentRef,
  className = '',
}: FashionEditorialContentProps) {
  return (
    <div
      ref={contentRef}
      className={`flex flex-col justify-center text-left ${className}`}
    >
      {/* 1. EDITORIAL BADGE: THE FASHION STAGE */}
      <div className="fashion-content-item inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#350a10]/80 border border-[#d6b46a]/50 text-[#f5d890] text-xs font-mono tracking-[0.22em] uppercase mb-4 sm:mb-6 shadow-md backdrop-blur-md">
        <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
        <span>THE FASHION STAGE</span>
      </div>

      {/* 2. MAIN HEADING: The Runway Experience (Bodoni Moda) */}
      <h2
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="fashion-content-item text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#350a10] tracking-tight leading-[1.12] mb-4 break-words"
      >
        <span className="block bg-gradient-to-r from-[#350a10] via-[#891523] to-[#540c14] bg-clip-text text-transparent drop-shadow-xs">
          {title}
        </span>
      </h2>

      {/* 3. MINIMAL METALLIC GOLD ORNAMENT DIVIDER */}
      <div className="fashion-content-item w-32 sm:w-44 my-2 sm:my-3 relative flex items-center justify-start">
        <div className="w-full h-[1.5px] bg-gradient-to-r from-[#d6b46a] via-[#891523]/50 to-transparent" />
        <div className="absolute left-6 w-2 h-2 rotate-45 bg-[#fef08a] border border-[#a16207] shadow-[0_0_8px_rgba(250,204,21,0.85)]" />
      </div>

      {/* 4. EDITORIAL DESCRIPTION (DM Sans, dari Data Admin Panitia) */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="fashion-content-item text-sm sm:text-base text-neutral-700 leading-relaxed font-normal max-w-xl mt-3 mb-6 sm:mb-8"
      >
        {description}
      </p>

      {/* 5. EXPLORE FASHION SHOW CTA BUTTON */}
      <div className="fashion-content-item pt-1">
        <Link
          href="/fashion-show"
          className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#f5d890]/80 text-[#fffdfa] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_8px_25px_rgba(181,39,53,0.55)] hover:border-[#fef08a] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle Button Gloss Sweep on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

          <span>BUKA FASHION SHOW</span>
          <ArrowRight
            size={16}
            weight="bold"
            className="text-[#fef08a] group-hover:translate-x-1 transition-transform duration-300"
          />
        </Link>
      </div>
    </div>
  );
}
