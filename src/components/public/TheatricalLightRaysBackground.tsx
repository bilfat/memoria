'use client';

import React from 'react';

/**
 * TheatricalLightRaysBackground
 * Menghadirkan latar belakang terang mewah (luminous pearl / warm ivory)
 * yang tersambung secara kontinu dari Hero, Artis Band, Fashion Show, Awarding, hingga Footer.
 * Diperkaya dengan "Cahaya Garis-Garis Merah" (Theatrical Crimson Laser Rays & Spotlights)
 * serta aksen pinstripe emas teater yang anggun dan sinematik.
 */
export function TheatricalLightRaysBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Base Luminous Pearl Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fcfbf9] via-[#f8f5ee] to-[#f5f0e6]" />

      {/* 2. Cahaya Garis-Garis Merah (Primary Theatrical Laser Rays - Diagonal -45deg) */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 70px,
              rgba(181, 39, 53, 0.04) 70px,
              rgba(181, 39, 53, 0.18) 72px,
              rgba(225, 29, 72, 0.22) 73px,
              rgba(181, 39, 53, 0.18) 74px,
              rgba(181, 39, 53, 0.04) 76px,
              transparent 77px,
              transparent 160px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 240px,
              rgba(137, 21, 35, 0.03) 240px,
              rgba(181, 39, 53, 0.14) 243px,
              rgba(244, 63, 94, 0.20) 245px,
              rgba(181, 39, 53, 0.14) 247px,
              rgba(137, 21, 35, 0.03) 250px,
              transparent 251px,
              transparent 480px
            )
          `,
        }}
      />

      {/* 3. Intersecting Theatrical Gold Pinstripes & Counter Rays (45deg) */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 110px,
              rgba(214, 180, 106, 0.03) 110px,
              rgba(214, 180, 106, 0.12) 112px,
              rgba(245, 216, 144, 0.18) 113px,
              rgba(214, 180, 106, 0.12) 114px,
              rgba(214, 180, 106, 0.03) 116px,
              transparent 117px,
              transparent 240px
            )
          `,
        }}
      />

      {/* 4. Volumetric Crimson Spotlight Beams (Berkas Cahaya Sorot Merah Teater yang Membelah Kanvas) */}
      {/* Beam A: Top Left Spotlight projecting across Hero & Band */}
      <div
        className="absolute top-0 left-[-10%] w-[120vw] h-[1600px] pointer-events-none opacity-45"
        style={{
          background: `
            conic-gradient(
              from 135deg at 10% 0%,
              transparent 0deg,
              rgba(181, 39, 53, 0.03) 12deg,
              rgba(225, 29, 72, 0.15) 18deg,
              rgba(255, 255, 255, 0.25) 20deg,
              rgba(225, 29, 72, 0.15) 22deg,
              rgba(181, 39, 53, 0.04) 28deg,
              transparent 38deg
            )
          `,
          transform: 'rotate(-8deg)',
        }}
      />

      {/* Beam B: Top Right Spotlight projecting across Hero & Band */}
      <div
        className="absolute top-0 right-[-10%] w-[120vw] h-[1600px] pointer-events-none opacity-40"
        style={{
          background: `
            conic-gradient(
              from 225deg at 90% 0%,
              transparent 0deg,
              rgba(181, 39, 53, 0.03) 12deg,
              rgba(225, 29, 72, 0.14) 18deg,
              rgba(214, 180, 106, 0.18) 20deg,
              rgba(225, 29, 72, 0.14) 22deg,
              rgba(181, 39, 53, 0.03) 28deg,
              transparent 38deg
            )
          `,
          transform: 'rotate(8deg)',
        }}
      />

      {/* Beam C: Mid-page Theatrical Crimson Cross-Beam (Fashion Show & Awarding) */}
      <div
        className="absolute top-[1800px] left-0 w-full h-[2200px] pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 80% 40% at 20% 30%, rgba(181, 39, 53, 0.12), transparent 70%),
            radial-gradient(ellipse 75% 35% at 80% 65%, rgba(181, 39, 53, 0.12), transparent 70%),
            linear-gradient(130deg, transparent 20%, rgba(225, 29, 72, 0.08) 35%, rgba(214, 180, 106, 0.08) 42%, transparent 55%),
            linear-gradient(-130deg, transparent 40%, rgba(225, 29, 72, 0.09) 55%, rgba(181, 39, 53, 0.06) 62%, transparent 75%)
          `,
        }}
      />

      {/* Beam D: Bottom-page Grand Ceremony Finale Rays (Leading into Footer) */}
      <div
        className="absolute bottom-0 left-0 w-full h-[1200px] pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(181, 39, 53, 0.14), rgba(214, 180, 106, 0.08) 45%, transparent 75%),
            repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 80px,
              rgba(181, 39, 53, 0.08) 82px,
              rgba(225, 29, 72, 0.16) 84px,
              rgba(181, 39, 53, 0.08) 86px,
              transparent 88px,
              transparent 180px
            )
          `,
        }}
      />

      {/* 5. Subtle Vignette & Theatrical Vertical Ray Streaks */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(181, 39, 53, 0.06) 0%, transparent 15%, transparent 85%, rgba(181, 39, 53, 0.06) 100%)
          `,
        }}
      />
    </div>
  );
}

