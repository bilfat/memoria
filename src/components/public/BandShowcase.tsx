'use client';

import React from 'react';
import { Band } from '@/types';
import { Sparkle, Disc } from '@phosphor-icons/react';

interface BandShowcaseProps {
  bands: Band[];
}

export function BandShowcase({ bands }: BandShowcaseProps) {
  // Hanya ambil 1 artis bintang band utama
  const band = bands && bands.length > 0 ? bands[0] : null;

  if (!band) return null;

  return (
    <section
      id="lineup-band"
      aria-label="Panggung Bintang Tamu Artis Utama MEMORIA"
      className="relative w-full py-16 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#d6b46a]/30"
    >
      {/* Keyframe Styles for 3D Cinematic Band Silhouette & Spotlight Beams */}
      <style jsx>{`
        @keyframes stage-sway-3d {
          0%, 100% {
            transform: perspective(1000px) rotateY(-10deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateY(10deg) translateY(-6px);
          }
        }
        @keyframes spotlight-sway-left {
          0%, 100% {
            transform: rotate(-18deg) scaleY(1);
            opacity: 0.65;
          }
          50% {
            transform: rotate(-12deg) scaleY(1.06);
            opacity: 0.9;
          }
        }
        @keyframes spotlight-sway-right {
          0%, 100% {
            transform: rotate(18deg) scaleY(1);
            opacity: 0.65;
          }
          50% {
            transform: rotate(12deg) scaleY(1.06);
            opacity: 0.9;
          }
        }
        @keyframes spotlight-pulse-center {
          0%, 100% {
            opacity: 0.75;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.95;
            transform: scaleX(1.1);
          }
        }
        .animate-band-sway {
          animation: stage-sway-3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: visible;
          -webkit-backface-visibility: visible;
        }
        .animate-band-sway img {
          backface-visibility: visible;
          -webkit-backface-visibility: visible;
        }
        .animate-band-sway:hover {
          animation-play-state: paused;
        }
        .spotlight-beam-left {
          animation: spotlight-sway-left 6s ease-in-out infinite;
          transform-origin: bottom center;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .spotlight-beam-right {
          animation: spotlight-sway-right 6s ease-in-out infinite;
          transform-origin: bottom center;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .spotlight-beam-center {
          animation: spotlight-pulse-center 4s ease-in-out infinite;
          transform-origin: bottom center;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* Stage Ambient Warm Golden Glow */}
      <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(214,180,106,0.1)_0%,_transparent_70%)] blur-3xl pointer-events-none" />

      {/* Main Responsive Grid Container (Sama persis seperti section Fashion & Awarding) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* SISI KIRI: NAMA BAND & DESKRIPSI (45% Area di Desktop, Bawah di Mobile) */}
          <div data-scroll-stagger="left" className="lg:col-span-5 order-2 lg:order-1 px-2 sm:px-4 text-left">
            {/* 1. EDITORIAL BADGE */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#350a10]/80 border border-[#d6b46a]/50 text-[#f5d890] text-xs font-mono tracking-[0.22em] uppercase mb-4 sm:mb-6 shadow-md backdrop-blur-md">
              <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
              <span>HEADLINER GUEST STAR</span>
            </div>

            {/* 2. NAMA BAND (Bodoni Serif Megah) */}
            <h2
              style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#350a10] tracking-tight leading-[1.12] mb-4 break-words"
            >
              <span className="block bg-gradient-to-r from-[#350a10] via-[#891523] to-[#540c14] bg-clip-text text-transparent drop-shadow-xs">
                {band.name}
              </span>
            </h2>

            {/* 3. MINIMAL METALLIC GOLD ORNAMENT DIVIDER */}
            <div className="w-32 sm:w-44 my-2 sm:my-3 relative flex items-center justify-start">
              <div className="w-full h-[1.5px] bg-gradient-to-r from-[#d6b46a] via-[#891523]/50 to-transparent" />
              <div className="absolute left-6 w-2 h-2 rotate-45 bg-[#fef08a] border border-[#a16207] shadow-[0_0_8px_rgba(250,204,21,0.85)]" />
            </div>

            {/* 4. DESKRIPSI BAND DARI DASHBOARD */}
            <p
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal max-w-xl mt-3 mb-6"
            >
              {band.description}
            </p>

            {/* 5. LIVE PERFORMANCE BADGE */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-neutral-50/90 border border-[#d6b46a]/40 text-[#350a10] text-xs tracking-wider shadow-xs font-medium">
                <Disc size={17} className="text-[#d6b46a] animate-spin" style={{ animationDuration: '4s' }} />
                <span>Live Orchestral Concert</span>
              </div>
            </div>
          </div>

          {/* SISI KANAN: FOTO BAND + PANGGUNG + SPOTLIGHTS (55% Dominan Visual di Desktop, Atas di Mobile) */}
          <div data-scroll-stagger="right" className="lg:col-span-7 order-1 lg:order-2 w-full">
            <div className="relative w-full flex flex-col items-center justify-end min-h-[360px] sm:min-h-[440px] md:min-h-[480px]">
              
              {/* 1. UPWARD SPOTLIGHT BEAMS */}
              <div className="absolute inset-x-0 bottom-12 sm:bottom-16 md:bottom-20 h-[300px] sm:h-[380px] pointer-events-none z-10 flex justify-center items-end">
                {/* Left Spotlight */}
                <div
                  className="spotlight-beam-left absolute bottom-0 left-[15%] sm:left-[22%] w-32 sm:w-44 h-full opacity-60"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 100%, transparent 75deg, rgba(214, 180, 106, 0.08) 83deg, rgba(214, 180, 106, 0.3) 88deg, rgba(245, 216, 144, 0.65) 90deg, rgba(214, 180, 106, 0.3) 92deg, rgba(214, 180, 106, 0.08) 97deg, transparent 105deg)',
                  }}
                />

                {/* Right Spotlight */}
                <div
                  className="spotlight-beam-right absolute bottom-0 right-[15%] sm:right-[22%] w-32 sm:w-44 h-full opacity-60"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 100%, transparent 75deg, rgba(214, 180, 106, 0.08) 83deg, rgba(214, 180, 106, 0.3) 88deg, rgba(245, 216, 144, 0.65) 90deg, rgba(214, 180, 106, 0.3) 92deg, rgba(214, 180, 106, 0.08) 97deg, transparent 105deg)',
                  }}
                />

                {/* Center Spotlight */}
                <div
                  className="spotlight-beam-center absolute bottom-0 w-40 sm:w-56 h-full opacity-70"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 100%, transparent 80deg, rgba(214, 180, 106, 0.12) 85deg, rgba(214, 180, 106, 0.35) 88deg, rgba(245, 233, 211, 0.8) 90deg, rgba(214, 180, 106, 0.35) 92deg, rgba(214, 180, 106, 0.12) 95deg, transparent 100deg)',
                  }}
                />
              </div>

              {/* 2. BAND SILHOUETTE PHOTO WITH 3D SWAY */}
              <div className="relative z-30 flex flex-col items-center justify-center mb-[-32px] sm:mb-[-48px] md:mb-[-60px]">
                <div className="animate-band-sway cursor-pointer w-72 sm:w-[420px] md:w-[500px] lg:w-[540px] aspect-[16/10] flex items-center justify-center relative">
                  <img
                    src={band.photo || '/images/band-silhouette.png'}
                    alt={`Siluet Aksi ${band.name}`}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] select-none pointer-events-none"
                  />
                </div>

                {/* Feet Reflection Glow */}
                <div className="w-56 sm:w-80 md:w-96 h-3 rounded-full bg-gradient-to-r from-transparent via-[#f5d890] to-transparent opacity-60" />
              </div>

              {/* 3. LUXURIOUS 3D CONCERT STAGE PODIUM */}
              <div className="relative z-20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center select-none pointer-events-none mt-[-20px] sm:mt-[-32px] md:mt-[-42px]">
                <img
                  src="/images/theatre-concert-podium-hd-clean.png"
                  alt="Panggung Konser Teater 3D Memoria Super HD"
                  className="w-full h-auto object-contain filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.25)]"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
