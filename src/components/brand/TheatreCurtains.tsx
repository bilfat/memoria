'use client';

import React, { forwardRef } from 'react';

interface TheatreCurtainsProps {
  leftCurtainRef: React.RefObject<HTMLDivElement | null>;
  rightCurtainRef: React.RefObject<HTMLDivElement | null>;
}

export const TheatreCurtains = forwardRef<HTMLDivElement, TheatreCurtainsProps>(
  ({ leftCurtainRef, rightCurtainRef }, _ref) => {
    return (
      <>
        {/* 1. BACKSTAGE AMBIENT DEPTH (Latar Belakang Panggung di Balik Tirai) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 50% 45%, #3d0c13 0%, #200508 55%, #0c0204 100%)',
          }}
        >
          {/* Top Stage Valance Shadow */}
          <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* 2. DUAL OPERATING VELVET CURTAINS (Menutup Sempurna di Tengah, Membuka Mulus ke Kiri & Kanan) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {/* LEFT CURTAIN (Separuh Kiri: Menutup dari Sisi Kiri hingga Melewati Tengah 50.8%) */}
          <div
            ref={leftCurtainRef}
            className="absolute inset-y-0 left-0 w-[50.8%] z-20 origin-left flex will-change-transform shadow-[15px_0_40px_rgba(0,0,0,0.95)]"
            style={{
              background:
                'repeating-linear-gradient(90deg, #1b0305 0px, #42080f 18px, #7c121e 40px, #b02331 60px, #d13747 70px, #b02331 80px, #7c121e 100px, #42080f 122px, #1b0305 140px)',
              boxShadow: 'inset -25px 0 55px rgba(0,0,0,0.85), 12px 0 35px rgba(0,0,0,0.9)',
              transform: 'translateX(0%)',
            }}
          >
            {/* Soft Vertical Drape Shadow & Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75 pointer-events-none" />

            {/* Golden Fringe Trim on the Center Meeting Edge (Tepi Kanan Tirai Kiri) */}
            <div className="absolute right-0 inset-y-0 w-2.5 sm:w-3.5 bg-gradient-to-r from-[#8a601e] via-[#fdf1c7] to-[#d6b46a] shadow-[0_0_15px_rgba(214,180,106,0.8)] flex flex-col justify-around py-2 items-center z-10">
              {[...Array(32)].map((_, i) => (
                <div key={`l-trim-${i}`} className="w-1.5 h-1.5 bg-[#fff8db] rounded-full opacity-90 shadow-xs" />
              ))}
            </div>
          </div>

          {/* RIGHT CURTAIN (Separuh Kanan: Menutup dari Sisi Kanan hingga Melewati Tengah 50.8%) */}
          <div
            ref={rightCurtainRef}
            className="absolute inset-y-0 right-0 w-[50.8%] z-20 origin-right flex will-change-transform shadow-[-15px_0_40px_rgba(0,0,0,0.95)]"
            style={{
              background:
                'repeating-linear-gradient(90deg, #1b0305 0px, #42080f 18px, #7c121e 40px, #b02331 60px, #d13747 70px, #b02331 80px, #7c121e 100px, #42080f 122px, #1b0305 140px)',
              boxShadow: 'inset 25px 0 55px rgba(0,0,0,0.85), -12px 0 35px rgba(0,0,0,0.9)',
              transform: 'translateX(0%)',
            }}
          >
            {/* Soft Vertical Drape Shadow & Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75 pointer-events-none" />

            {/* Golden Fringe Trim on the Center Meeting Edge (Tepi Kiri Tirai Kanan) */}
            <div className="absolute left-0 inset-y-0 w-2.5 sm:w-3.5 bg-gradient-to-r from-[#d6b46a] via-[#fdf1c7] to-[#8a601e] shadow-[0_0_15px_rgba(214,180,106,0.8)] flex flex-col justify-around py-2 items-center z-10">
              {[...Array(32)].map((_, i) => (
                <div key={`r-trim-${i}`} className="w-1.5 h-1.5 bg-[#fff8db] rounded-full opacity-90 shadow-xs" />
              ))}
            </div>
          </div>

          {/* Golden Tieback Cords & Tassels on Outer Edges */}
          <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-32 flex flex-col items-center pointer-events-none opacity-90 z-20">
            <div className="w-8 sm:w-10 h-14 sm:h-16 rounded-full border-2 border-[#f5d890] shadow-[0_0_10px_rgba(245,216,144,0.7)]" />
            <div className="w-3 sm:w-4 h-10 sm:h-12 bg-gradient-to-b from-[#f5d890] via-[#d6b46a] to-[#966a22] rounded-b-md shadow-md" />
          </div>
          <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-32 flex flex-col items-center pointer-events-none opacity-90 z-20">
            <div className="w-8 sm:w-10 h-14 sm:h-16 rounded-full border-2 border-[#f5d890] shadow-[0_0_10px_rgba(245,216,144,0.7)]" />
            <div className="w-3 sm:w-4 h-10 sm:h-12 bg-gradient-to-b from-[#f5d890] via-[#d6b46a] to-[#966a22] rounded-b-md shadow-md" />
          </div>
        </div>
      </>
    );
  }
);

TheatreCurtains.displayName = 'TheatreCurtains';
