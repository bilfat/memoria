'use client';

import React from 'react';

/**
 * GoldGlowBase
 * Efek pendaran cahaya / shadow emas lembut di bawah foto pemenang.
 * Memberikan kesan foto "berdiri" anggun di atas refleksi cahaya panggung galeri seni.
 */
export function GoldGlowBase() {
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[85%] h-9 pointer-events-none transition-all duration-500 ease-out z-0 group-hover:w-[94%] group-hover:h-12 group-hover:opacity-100"
    >
      {/* Primary Warm Gold Ellipse Glow */}
      <div
        className="w-full h-full"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(214, 180, 106, 0.45) 0%,
              rgba(234, 207, 164, 0.25) 45%,
              rgba(245, 216, 144, 0.1) 60%,
              transparent 75%
            )
          `,
          filter: 'blur(9px)',
        }}
      />

      {/* Subtle core highlight line beneath the center of the frame */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D6B46A]/60 to-transparent blur-[0.5px]" />
    </div>
  );
}

