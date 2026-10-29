'use client';

import React from 'react';
import { RunwayBackdrop } from './RunwayBackdrop';
import { VelvetRunway } from './VelvetRunway';
import { RunwayEdgeLights } from './RunwayEdgeLights';
import { RunwaySpotlights } from './RunwaySpotlights';
import { RunwayLightingRig } from './RunwayLightingRig';
import { FashionModel } from './FashionModel';
import { FashionStageParticles } from './FashionStageParticles';

interface FashionStageProps {
  lightingRigRef: React.RefObject<HTMLDivElement | null>;
  spotlightsRef: React.RefObject<HTMLDivElement | null>;
  modelRef: React.RefObject<HTMLDivElement | null>;
  lightSweepRef: React.RefObject<HTMLDivElement | null>;
  leftCurtainRef?: React.RefObject<HTMLDivElement | null>;
  rightCurtainRef?: React.RefObject<HTMLDivElement | null>;
  customImage?: string;
  className?: string;
}

export function FashionStage({
  lightingRigRef,
  spotlightsRef,
  modelRef,
  lightSweepRef,
  leftCurtainRef,
  rightCurtainRef,
  customImage,
  className = '',
}: FashionStageProps) {
  return (
    <div
      className={`relative w-full rounded-[28px] sm:rounded-[44px] overflow-hidden bg-[#140809] border border-[#d6b46a]/40 shadow-[0_30px_80px_rgba(20,8,9,0.55),0_10px_30px_rgba(0,0,0,0.35)] min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex flex-col justify-between select-none ${className}`}
    >
      {/* 1. BACKSTAGE VELVET DRAPES & VANISHING POINT */}
      <RunwayBackdrop
        leftCurtainRef={leftCurtainRef}
        rightCurtainRef={rightCurtainRef}
      />

      {/* 2. 3D PERSPECTIVE VELVET RUNWAY CATWALK FLOOR */}
      <VelvetRunway />

      {/* 3. RUNWAY SEQUENTIAL EDGE LIGHTS */}
      <RunwayEdgeLights />

      {/* 4. FLOATING GOLDEN PARTICLES */}
      <FashionStageParticles />

      {/* 5. OVERHEAD LINEAR LIGHTING RIG TRUSS */}
      <div className="relative z-30 pt-3 sm:pt-5 px-4">
        <RunwayLightingRig ref={lightingRigRef} />
      </div>

      {/* 6. VOLUMETRIC RUNWAY SPOTLIGHT BEAMS */}
      <RunwaySpotlights ref={spotlightsRef} />

      {/* 7. HAUTE COUTURE FASHION MODEL ON RUNWAY */}
      <div className="relative z-20 flex items-end justify-center w-full px-4 -mt-8 sm:-mt-14 pb-2 sm:pb-4">
        <FashionModel
          ref={modelRef}
          customImage={customImage}
          lightSweepRef={lightSweepRef}
        />
      </div>

      {/* 8. CATWALK FRONT PLINTH FOOTER STRIP */}
      <div className="relative z-25 w-full bg-gradient-to-r from-[#140809] via-[#2a060a] to-[#140809] border-t-2 border-[#d6b46a]/60 shadow-[0_-10px_25px_rgba(0,0,0,0.9)] py-2 sm:py-3 px-4 flex items-center justify-between">
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#f5d890] to-transparent" />
        <span className="text-[7.5px] sm:text-[9.5px] font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#d6b46a]/70 font-semibold truncate">
          VELVET CATWALK • RUNWAY EXPERIENCE
        </span>
        <span className="text-[7.5px] sm:text-[9.5px] font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#f5d890]/80 font-semibold truncate">
          HAUTE COUTURE DIESNATALIS
        </span>
      </div>
    </div>
  );
}
