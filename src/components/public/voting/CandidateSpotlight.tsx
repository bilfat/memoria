'use client';

import React from 'react';

/**
 * CandidateSpotlight
 * Pencahayaan panggung teater emas (golden spotlight) dari atas foto kandidat.
 * Menghadirkan fixture kuningan minimalis dan berkas cahaya cone emas lembut
 * yang menyorot ke arah tengah tubuh kandidat.
 */
export function CandidateSpotlight() {
  return (
    <div
      aria-hidden="true"
      className="candidate-spotlight absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-500 opacity-80 group-hover:opacity-100 select-none"
    >
      {/* 1. Fixture Lampu Panggung Kuningan di Bagian Atas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#D6B46A]/50 via-[#F5D890] to-[#D6B46A]/50 rounded-b-full shadow-[0_0_10px_rgba(214,180,106,0.9)] z-20" />

      {/* 2. Soft Conical Beam (Berkas Cahaya Emas Lembut Menyorot ke Tengah) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[160%] h-[80%] pointer-events-none"
        style={{
          background: `
            conic-gradient(
              from 180deg at 50% 0%,
              transparent 34%,
              rgba(214, 180, 106, 0.18) 42%,
              rgba(245, 216, 144, 0.42) 49%,
              rgba(255, 248, 230, 0.58) 50%,
              rgba(245, 216, 144, 0.42) 51%,
              rgba(214, 180, 106, 0.18) 58%,
              transparent 66%
            )
          `,
          filter: 'blur(14px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 3. Top-to-Bottom Ambient Golden Wash */}
      <div
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(245,216,144,0.22) 0%, rgba(214,180,106,0.1) 40%, transparent 100%)',
        }}
      />

      {/* 4. Top Rim Subtle Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5D890]/70 to-transparent" />
    </div>
  );
}

