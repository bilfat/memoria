'use client';

import React from 'react';

/**
 * SpotlightOverlay
 * Golden Hall of Fame — Overhead Gallery Ceiling Spotlight
 * - Minimalist champagne gold brass fixture di atas tengah foto.
 * - Conical light beam yang memancar dari lampu ke seluruh area foto pemenang.
 * - Warm white & champagne gold gradient yang anggun di atas latar belakang putih/ivory.
 */
export function SpotlightOverlay() {
  return (
    <div
      aria-hidden="true"
      className="award-spotlight-beam absolute inset-0 pointer-events-none overflow-visible rounded-2xl z-20 transition-all duration-700 ease-out opacity-85 group-hover:opacity-100"
    >
      {/* 1. Ceiling Gallery Spotlight Fixture (Lampu Plafon Minimalis Emas) */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none">
        {/* Track Mounting Bracket */}
        <div className="w-5 h-1 bg-[#A67B39]/70 rounded-t-sm" />
        {/* Brass Fixture Casing */}
        <div className="w-10 sm:w-12 h-3 bg-gradient-to-r from-[#8C6228] via-[#EACFA4] to-[#8C6228] rounded-b-md shadow-[0_2px_8px_rgba(166,123,57,0.35)] flex items-center justify-center border-t border-[#FFFDF8]/60">
          {/* Glowing Bulb Core */}
          <div className="w-3.5 h-1.5 rounded-full bg-gradient-to-r from-[#FFEEC2] via-[#FFFFFF] to-[#FFEEC2] shadow-[0_0_8px_rgba(245,216,144,0.95)]" />
        </div>
        {/* Ambient Halo at the Fixture Mount */}
        <div className="w-8 h-2 rounded-full bg-[#F5D890]/40 blur-[3px] -mt-1" />
      </div>

      {/* 2. Overhead Conical Light Beam (Berkas Cahaya Kerucut ke Bawah) */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-[125%] h-[105%] pointer-events-none rounded-2xl transition-opacity duration-700"
        style={{
          clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
          background: `
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.75) 0%,
              rgba(245, 216, 144, 0.42) 20%,
              rgba(234, 207, 164, 0.22) 55%,
              rgba(214, 180, 106, 0.08) 85%,
              transparent 100%
            )
          `,
          filter: 'blur(10px)',
          mixBlendMode: 'normal',
        }}
      />

      {/* 3. Subtle Gallery Glass Reflection Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5D890]/90 to-transparent" />
    </div>
  );
}
