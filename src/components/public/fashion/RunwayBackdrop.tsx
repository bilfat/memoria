'use client';

import React from 'react';

interface RunwayBackdropProps {
  leftCurtainRef?: React.RefObject<HTMLDivElement | null>;
  rightCurtainRef?: React.RefObject<HTMLDivElement | null>;
}

export function RunwayBackdrop({ leftCurtainRef, rightCurtainRef }: RunwayBackdropProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-5 overflow-hidden">
      {/* 1. DEEP VELVET BACKSTAGE VANISHING POINT GLOW */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #3a0a11 0%, #1a0408 55%, #0c0204 100%)',
        }}
      />

      {/* Vanishing Point Golden Gateway Portal (Pintu Masuk Model di Ujung Runway) */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-44 sm:w-56 h-48 sm:h-64 rounded-t-full opacity-65"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(245,216,144,0.35) 0%, rgba(137,21,35,0.4) 60%, transparent 100%)',
          boxShadow: '0 0 45px rgba(214,180,106,0.3)',
        }}
      />

      {/* 2. LEFT THEATRICAL VELVET CURTAIN (Tirai Kiri yang Sedikit Terbuka) */}
      <div
        ref={leftCurtainRef}
        className="absolute inset-y-0 left-0 w-24 sm:w-36 z-10 origin-left will-change-transform shadow-[15px_0_35px_rgba(0,0,0,0.9)]"
        style={{
          background:
            'repeating-linear-gradient(90deg, #100204 0px, #260509 14px, #580d17 30px, #891523 45px, #580d17 60px, #200407 75px, #100204 90px)',
          boxShadow: 'inset -15px 0 30px rgba(0,0,0,0.85), 10px 0 25px rgba(0,0,0,0.9)',
        }}
      >
        {/* Soft Gold Fringe Trim on Inner Drape Edge */}
        <div className="absolute right-0 inset-y-0 w-1.5 bg-gradient-to-b from-[#f5d890] via-[#d6b46a] to-[#855716] opacity-85 shadow-[0_0_10px_rgba(214,180,106,0.6)]" />
      </div>

      {/* 3. RIGHT THEATRICAL VELVET CURTAIN (Tirai Kanan yang Sedikit Terbuka) */}
      <div
        ref={rightCurtainRef}
        className="absolute inset-y-0 right-0 w-24 sm:w-36 z-10 origin-right will-change-transform shadow-[-15px_0_35px_rgba(0,0,0,0.9)]"
        style={{
          background:
            'repeating-linear-gradient(90deg, #100204 0px, #200407 15px, #580d17 30px, #891523 45px, #580d17 60px, #260509 76px, #100204 90px)',
          boxShadow: 'inset 15px 0 30px rgba(0,0,0,0.85), -10px 0 25px rgba(0,0,0,0.9)',
        }}
      >
        {/* Soft Gold Fringe Trim on Inner Drape Edge */}
        <div className="absolute left-0 inset-y-0 w-1.5 bg-gradient-to-b from-[#f5d890] via-[#d6b46a] to-[#855716] opacity-85 shadow-[0_0_10px_rgba(214,180,106,0.6)]" />
      </div>

      {/* 4. UPPER ARCHITECTURAL VALANCE DRAPERY (Kelim Tirai Atas dengan Lipatan Gelap) */}
      <div
        className="absolute top-0 inset-x-0 h-16 sm:h-20 z-12 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% -20%, #891523 0%, #350a10 60%, #140809 100%)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
          borderBottom: '1.5px solid rgba(214,180,106,0.65)',
        }}
      >
        <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent_0px,rgba(0,0,0,0.4)_18px,transparent_36px)] opacity-50" />
      </div>
    </div>
  );
}
