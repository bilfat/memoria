'use client';

import React from 'react';

/**
 * GoldGlowBase
 * Golden Hall of Fame — Gallery Floor Reflection
 * Pendaran cahaya horizontal emas lembut di bawah foto pemenang,
 * menyerupai berkas spotlight dari atas yang jatuh anggun ke lantai galeri.
 * Menggunakan gradien elips warm gold/champagne tanpa podium fisik kaku.
 */
export function GoldGlowBase() {
  return (
    <div
      aria-hidden="true"
      className="award-gold-glow absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[82%] sm:w-[88%] h-9 sm:h-12 pointer-events-none transition-all duration-700 ease-out z-0 group-hover:w-[94%] group-hover:h-14 group-hover:opacity-100"
    >
      {/* Primary Warm Gold Ellipse Glow */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 40%,
              rgba(214, 180, 106, 0.55) 0%,
              rgba(234, 207, 164, 0.35) 40%,
              rgba(245, 216, 144, 0.15) 60%,
              transparent 75%
            )
          `,
          filter: 'blur(10px)',
        }}
      />

      {/* Subtle core highlight line beneath the center of the frame */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-[#D6B46A]/80 to-transparent blur-[0.6px]" />
    </div>
  );
}
