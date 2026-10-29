'use client';

import React from 'react';
import { CircularLightRig } from './CircularLightRig';
import { AwardSpotlight } from './AwardSpotlight';
import { GoldenTrophy } from './GoldenTrophy';
import { GoldenParticles } from './GoldenParticles';

interface AwardingStageProps {
  lightRigRef: React.RefObject<HTMLDivElement | null>;
  spotlightRef: React.RefObject<HTMLDivElement | null>;
  trophyRef: React.RefObject<HTMLDivElement | null>;
  lightSweepRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function AwardingStage({
  lightRigRef,
  spotlightRef,
  trophyRef,
  lightSweepRef,
  className = '',
}: AwardingStageProps) {
  return (
    <div
      className={`relative w-full rounded-[28px] sm:rounded-[44px] overflow-hidden bg-[#140809] border border-[#d6b46a]/40 shadow-[0_30px_80px_rgba(20,8,9,0.55),0_10px_30px_rgba(0,0,0,0.35)] min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex flex-col justify-between select-none ${className}`}
    >
      {/* 1. BACKSTAGE AMBIENT DEPTH & VELVET VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a0a11] via-[#1c0508] to-[#0c0204] z-0 pointer-events-none" />

      {/* Subtle Texture Grain / Soft Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(10,2,3,0.85)_100%)] z-1 pointer-events-none" />

      {/* 2. THEATRICAL VELVET DRAPES ON SIDES (Tirai Beludru Gelap di Sisi Kiri & Kanan Panggung) */}
      <div
        className="absolute inset-y-0 left-0 w-12 sm:w-20 pointer-events-none z-5 opacity-80"
        style={{
          background:
            'repeating-linear-gradient(90deg, #100204 0px, #2a060a 12px, #3a0a11 25px, #180306 40px)',
          boxShadow: 'inset -12px 0 25px rgba(0,0,0,0.9)',
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-12 sm:w-20 pointer-events-none z-5 opacity-80"
        style={{
          background:
            'repeating-linear-gradient(90deg, #180306 0px, #3a0a11 15px, #2a060a 28px, #100204 40px)',
          boxShadow: 'inset 12px 0 25px rgba(0,0,0,0.9)',
        }}
      />

      {/* 3. GOLDEN PARTICLES (Debu Emas Melayang Lembut) */}
      <GoldenParticles />

      {/* 4. OVERHEAD CIRCULAR LIGHTING RIG (Scene A: Turun Perlahan dari Atas) */}
      <div className="relative z-30 pt-4 sm:pt-6 px-4">
        <CircularLightRig ref={lightRigRef} />
      </div>

      {/* 5. VOLUMETRIC SPOTLIGHT BEAMS (Scene B: Menyala Menyorot Trophy) */}
      <AwardSpotlight ref={spotlightRef} />

      {/* 6. TROPHY & PEDESTAL (Scene C: Naik / Reveal dengan Easing Anggun) */}
      <div className="relative z-20 flex items-end justify-center w-full px-4 -mt-10 sm:-mt-16 pb-3 sm:pb-5">
        <GoldenTrophy ref={trophyRef} lightSweepRef={lightSweepRef} />
      </div>

      {/* 7. STAGE BASE GROUND PLINTH (Lantai Panggung Bawah dengan Trim Emas Mewah) */}
      <div className="relative z-25 w-full bg-gradient-to-r from-[#140809] via-[#2a060a] to-[#140809] border-t-2 border-[#d6b46a]/60 shadow-[0_-10px_25px_rgba(0,0,0,0.9)] py-2 sm:py-3 px-4 flex items-center justify-between">
        {/* Soft Gold Footlight Glow */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#f5d890] to-transparent" />
        <span className="text-[7.5px] sm:text-[9.5px] font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#d6b46a]/70 font-semibold truncate">
          ANNUAL CEREMONY • MAIN PODIUM
        </span>
        <span className="text-[7.5px] sm:text-[9.5px] font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#f5d890]/80 font-semibold truncate">
          TELKOM UNIVERSITY
        </span>
      </div>
    </div>
  );
}

