'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface GoldenTrophyProps {
  className?: string;
  lightSweepRef?: React.RefObject<HTMLDivElement | null>;
}

export const GoldenTrophy = React.forwardRef<HTMLDivElement, GoldenTrophyProps>(
  function GoldenTrophy({ className = '', lightSweepRef }, ref) {
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, lift: 0 });

    // Scene F: Hover Interaction (Maksimal beberapa derajat dengan pergerakan halus)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Rotasi maksimal 6 derajat
      const rotateX = -((y - centerY) / centerY) * 5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      setTilt({ rotateX, rotateY, lift: -8 });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateX: 0, rotateY: 0, lift: 0 });
    };

    return (
      <div
        ref={ref}
        className={`relative z-20 flex flex-col items-center justify-end select-none ${className}`}
      >
        {/* Interactive 3D Hover Tilt Wrapper */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-56 sm:w-68 md:w-76 lg:w-[340px] aspect-[896/1200] overflow-hidden cursor-pointer transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${tilt.lift}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Photorealistic 3D Golden Trophy on Bronze/Marble Pedestal */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/awarding-trophy-final.png"
            alt="Patung Piala Emas The Golden Moment Awarding MEMORIA"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] pointer-events-none"
          />

          {/* Scene D: Golden Shine / Light Sweep Moving Across Trophy */}
          <div
            ref={lightSweepRef}
            className="absolute inset-0 pointer-events-none opacity-0"
            style={{
              background:
                'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.7) 48%, rgba(254,240,138,0.85) 52%, rgba(214,180,106,0.5) 58%, transparent 72%)',
              mixBlendMode: 'color-dodge',
              transform: 'translateX(-120%)',
            }}
          />

          {/* Interactive Hover Rim Highlight Flare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(255,250,230,0.3) 0%, transparent 60%)',
              opacity: tilt.lift !== 0 ? 0.8 : 0,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>
    );
  }
);
