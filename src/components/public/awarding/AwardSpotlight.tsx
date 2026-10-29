'use client';

import React from 'react';

interface AwardSpotlightProps {
  className?: string;
}

export const AwardSpotlight = React.forwardRef<HTMLDivElement, AwardSpotlightProps>(
  function AwardSpotlight({ className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 ${className}`}
      >
        {/* 1. PRIMARY MAIN SPOTLIGHT BEAM (Tegak Lurus Mengarah ke Trophy) */}
        <div
          className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg h-[86%] pointer-events-none origin-top"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, transparent 41%, rgba(214,180,106,0.12) 46%, rgba(255,248,220,0.3) 50%, rgba(214,180,106,0.12) 54%, transparent 59%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 2. SUPPORTING SPOTLIGHT BEAM KIRI (Sudut Miring dari Kiri Atas) */}
        <div
          className="absolute top-[8%] left-[22%] w-[65%] h-[82%] pointer-events-none origin-top-left -rotate-[12deg] opacity-70"
          style={{
            background:
              'conic-gradient(from 170deg at 20% 0%, transparent 43%, rgba(245,216,144,0.15) 48%, rgba(255,250,230,0.24) 50%, rgba(214,180,106,0.1) 53%, transparent 58%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 3. SUPPORTING SPOTLIGHT BEAM KANAN (Sudut Miring dari Kanan Atas) */}
        <div
          className="absolute top-[8%] right-[22%] w-[65%] h-[82%] pointer-events-none origin-top-right rotate-[12deg] opacity-70"
          style={{
            background:
              'conic-gradient(from 190deg at 80% 0%, transparent 42%, rgba(214,180,106,0.1) 47%, rgba(255,250,230,0.24) 50%, rgba(245,216,144,0.15) 52%, transparent 57%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 4. TROPHY LIGHT BLOOM (Aura Kilau Cahaya Tepat di Sekitar Sayap & Dada Piala) */}
        <div
          className="awarding-trophy-bloom absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,248,220,0.35) 0%, rgba(245,216,144,0.18) 35%, rgba(214,180,106,0.06) 60%, transparent 75%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 5. STAGE FLOOR LIGHT POOL (Pantulan Lingkaran Emas Lembut di Dasar Pedestal) */}
        <div
          className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[85%] max-w-sm h-24 rounded-[100%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(245,216,144,0.45) 0%, rgba(214,180,106,0.2) 45%, rgba(137,21,35,0.12) 65%, transparent 80%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    );
  }
);

