'use client';

import React, { useState } from 'react';

interface FashionModelProps {
  customImage?: string;
  lightSweepRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const FashionModel = React.forwardRef<HTMLDivElement, FashionModelProps>(
  function FashionModel({ customImage, lightSweepRef, className = '' }, ref) {
    const [tilt, setTilt] = useState({ rotateY: 0, lift: 0 });

    // Scene G: Hover Interaction (Parallax depth ringan)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const centerX = rect.width / 2;
      const rotateY = ((x - centerX) / centerX) * 4.5;
      setTilt({ rotateY, lift: -6 });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateY: 0, lift: 0 });
    };

    const modelSrc = customImage || '/images/fashion-model.png';

    return (
      <div
        ref={ref}
        className={`relative z-20 flex flex-col items-center justify-end select-none ${className}`}
      >
        {/* Interactive Catwalk Parallax Wrapper */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-56 sm:w-68 md:w-76 lg:w-[330px] aspect-[768/1376] overflow-hidden cursor-pointer transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(850px) rotateY(${tilt.rotateY}deg) translateY(${tilt.lift}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Haute Couture Runway Model */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={modelSrc}
            alt="Model Runway Fashion Show Haute Couture MEMORIA"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] pointer-events-none"
          />

          {/* Runway Floor Contact Shadow beneath model heels */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-8 rounded-[100%] pointer-events-none -z-1"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(16,4,6,0.95) 0%, rgba(20,5,8,0.7) 50%, transparent 80%)',
            }}
          />

          {/* Scene E: Golden Light Sweep Shimmer Moving Across Catwalk & Gown */}
          <div
            ref={lightSweepRef}
            className="absolute inset-0 pointer-events-none opacity-0"
            style={{
              background:
                'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.75) 48%, rgba(254,240,138,0.85) 52%, rgba(214,180,106,0.5) 58%, transparent 75%)',
              mixBlendMode: 'color-dodge',
              transform: 'translateX(-120%)',
            }}
          />

          {/* Interactive Hover Warm Spotlight Flare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(ellipse at 50% 35%, rgba(255,250,230,0.25) 0%, transparent 60%)',
              opacity: tilt.lift !== 0 ? 0.8 : 0,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>
    );
  }
);
