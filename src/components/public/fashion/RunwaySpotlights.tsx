'use client';

import React from 'react';

interface RunwaySpotlightsProps {
  className?: string;
}

export const RunwaySpotlights = React.forwardRef<HTMLDivElement, RunwaySpotlightsProps>(
  function RunwaySpotlights({ className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-16 ${className}`}
      >
        {/* 1. PRIMARY MAIN CATWALK SPOTLIGHT (Menyorot Langsung ke Titik Tengah Runway) */}
        <div
          className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[92%] max-w-md h-[88%] pointer-events-none origin-top"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, transparent 41%, rgba(214,180,106,0.15) 46%, rgba(255,248,220,0.32) 50%, rgba(214,180,106,0.15) 54%, transparent 59%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 2. LEFT CORRIDOR BEAM (Berkas Cahaya Runway Kiri) */}
        <div
          className="absolute top-[8%] left-[16%] w-[60%] h-[85%] pointer-events-none origin-top-left -rotate-[10deg] opacity-75"
          style={{
            background:
              'conic-gradient(from 170deg at 20% 0%, transparent 43%, rgba(245,216,144,0.14) 48%, rgba(255,250,230,0.22) 50%, rgba(214,180,106,0.1) 53%, transparent 57%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 3. RIGHT CORRIDOR BEAM (Berkas Cahaya Runway Kanan) */}
        <div
          className="absolute top-[8%] right-[16%] w-[60%] h-[85%] pointer-events-none origin-top-right rotate-[10deg] opacity-75"
          style={{
            background:
              'conic-gradient(from 190deg at 80% 0%, transparent 43%, rgba(214,180,106,0.1) 47%, rgba(255,250,230,0.22) 50%, rgba(245,216,144,0.14) 52%, transparent 57%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 4. MODEL CATWALK LIGHT BLOOM (Aura Panggung di Sekitar Model) */}
        <div
          className="fashion-spotlight-bloom absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-88 h-64 sm:h-88 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,248,220,0.28) 0%, rgba(245,216,144,0.14) 35%, rgba(214,180,106,0.05) 60%, transparent 75%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* 5. RUNWAY FLOOR CONTACT LIGHT POOL (Genangan Cahaya Emas di Titik Pijak Model) */}
        <div
          className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[75%] max-w-xs h-20 rounded-[100%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(245,216,144,0.4) 0%, rgba(214,180,106,0.18) 45%, rgba(137,21,35,0.1) 65%, transparent 80%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    );
  }
);
