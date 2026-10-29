'use client';

import React from 'react';

export function StagePlatform() {
  return (
    <div className="absolute bottom-0 inset-x-0 pointer-events-none z-25 flex flex-col items-center justify-end select-none">
      {/* 1. UPPER TIER STEP (Langkah Panggung Atas) */}
      <div className="w-[88%] max-w-5xl h-4 sm:h-10 bg-gradient-to-r from-[#350a10] via-[#891523] to-[#350a10] border-t sm:border-t-2 border-[#f5d890] rounded-t-xl sm:rounded-t-2xl shadow-[0_-12px_30px_rgba(0,0,0,0.85)] flex items-center justify-center relative overflow-hidden">
        {/* Soft Golden Footlight Reflection on Velvet Floor */}
        <div className="absolute inset-x-8 sm:inset-x-12 top-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-[#f5d890]/80 to-transparent" />
        <div className="w-1/2 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f5d890]/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. MIDDLE TIER STEP (Langkah Panggung Tengah) */}
      <div className="w-[96%] max-w-6xl h-4 sm:h-10 bg-gradient-to-r from-[#200407] via-[#520d16] to-[#200407] border-t sm:border-t-2 border-[#d6b46a] rounded-t-lg sm:rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden">
        {/* Gold Trim Line */}
        <div className="absolute inset-x-4 sm:inset-x-6 top-0 h-[1px] sm:h-[1.5px] bg-gradient-to-r from-transparent via-[#f5d890] to-transparent" />
      </div>

      {/* 3. BASE GROUND PLINTH (Langkah Panggung Bawah / Plinth) */}
      <div className="w-full h-7 sm:h-14 bg-gradient-to-r from-[#140809] via-[#2a060a] to-[#140809] border-t border-[#d6b46a]/50 shadow-[0_20px_45px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center relative overflow-hidden px-2">
        {/* Stage Contact Shadow that bleeds smoothly onto the white floor below */}
        <div className="w-full h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-[#d6b46a]/40 to-transparent" />
        <span className="text-[6.5px] sm:text-[9.5px] md:text-[11px] font-mono tracking-[0.1em] sm:tracking-[0.25em] md:tracking-[0.35em] uppercase text-[#d6b46a]/70 font-semibold mt-0.5 sm:mt-1 text-center truncate max-w-full">
          THEATRE PROSCENIUM STAGE • TELKOM UNIVERSITY
        </span>
      </div>
    </div>
  );
}

