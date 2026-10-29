'use client';

import React from 'react';

/**
 * SpotlightOverlay
 * Efek pencahayaan gallery spotlight dari atas foto pemenang.
 * Menghadirkan berkas cahaya lembut (conical beam & soft vertical wash)
 * dengan fixture pin kuningan di bagian atas tengah.
 */
export function SpotlightOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10 transition-opacity duration-500 opacity-80 group-hover:opacity-100"
    >
      {/* 1. Gallery Spotlight Lamp Mount (Fixture kuningan minimalis di atas) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#D6B46A]/60 via-[#F5D890] to-[#D6B46A]/60 rounded-b-full shadow-[0_0_8px_rgba(214,180,106,0.8)] z-20" />

      {/* 2. Soft Conical Spotlight Beam (Menyorot lembut ke arah tengah foto) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[160%] h-[75%] pointer-events-none"
        style={{
          background: `
            conic-gradient(
              from 180deg at 50% 0%,
              transparent 34%,
              rgba(255, 255, 255, 0.28) 42%,
              rgba(245, 216, 144, 0.45) 49%,
              rgba(255, 255, 255, 0.6) 50%,
              rgba(245, 216, 144, 0.45) 51%,
              rgba(255, 255, 255, 0.28) 58%,
              transparent 66%
            )
          `,
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 3. Top-to-Bottom Soft Illumination Wash */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(245,216,144,0.18) 35%, transparent 100%)',
        }}
      />

      {/* 4. Delicate Rim Highlight on Upper Frame */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5D890]/80 to-transparent" />
    </div>
  );
}

