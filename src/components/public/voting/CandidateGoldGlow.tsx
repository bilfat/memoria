'use client';

import React from 'react';

/**
 * CandidateGoldGlow
 * Pendaran cahaya / shadow emas antik tepat di bawah area foto kandidat.
 * Memberikan efek kandidat seolah berdiri anggun di atas panggung dengan pantulan cahaya emas,
 * tanpa kartu tebal atau platform berat.
 */
export function CandidateGoldGlow() {
  return (
    <div
      aria-hidden="true"
      className="candidate-gold-glow absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-10 pointer-events-none transition-all duration-500 ease-out z-0 group-hover:w-[96%] group-hover:h-14 group-hover:opacity-100 select-none"
    >
      {/* Primary Antique Gold Radial Glow */}
      <div
        className="w-full h-full"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(214, 180, 106, 0.48) 0%,
              rgba(234, 207, 164, 0.25) 42%,
              rgba(245, 216, 144, 0.1) 60%,
              transparent 75%
            )
          `,
          filter: 'blur(10px)',
        }}
      />

      {/* Center Golden Floor Horizon Accent */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3/5 h-[1.5px] bg-gradient-to-r from-transparent via-[#D6B46A]/70 to-transparent blur-[0.5px]" />
    </div>
  );
}

