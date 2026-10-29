'use client';

import React from 'react';
import { Band } from '@/types';
import { MusicNotes, Sparkle, Disc } from '@phosphor-icons/react';

interface BandShowcaseProps {
  bands: Band[];
}

export function BandShowcase({ bands }: BandShowcaseProps) {
  // Hanya ambil 1 artis bintang band utama
  const band = bands && bands.length > 0 ? bands[0] : null;

  if (!band) return null;

  return (
    <section id="lineup-band" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Keyframe Styles for 3D Cinematic Band Silhouette & Spotlight Beams */}
      <style jsx>{`
        @keyframes stage-sway-3d {
          0%, 100% {
            transform: perspective(1000px) rotateY(-12deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateY(12deg) translateY(-8px);
          }
        }
        @keyframes spotlight-sway-left {
          0%, 100% {
            transform: rotate(-18deg) scaleY(1);
            opacity: 0.7;
          }
          50% {
            transform: rotate(-12deg) scaleY(1.06);
            opacity: 0.95;
          }
        }
        @keyframes spotlight-sway-right {
          0%, 100% {
            transform: rotate(18deg) scaleY(1);
            opacity: 0.7;
          }
          50% {
            transform: rotate(12deg) scaleY(1.06);
            opacity: 0.95;
          }
        }
        @keyframes spotlight-pulse-center {
          0%, 100% {
            opacity: 0.8;
            transform: scaleX(1);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.12);
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

      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        
        <h2
          style={{ fontFamily: 'var(--font-bodoni), serif' }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-memoria-dark-wine tracking-wide"
        >
          Artis Bintang Band
        </h2>
        <p className="text-sm text-neutral-600 mt-3 font-normal max-w-lg mx-auto leading-relaxed">
          Satu bintang panggung utama yang menghidupkan harmoni spektakuler dan membakar semangat malam Diesnatalis.
        </p>
      </div>

      {/* THEATRE CONCERT STAGE ARENA */}
      <div className="relative max-w-5xl mx-auto">
        {/* Stage Container (Tanpa background merah, bersih dan transparan) */}
        <div className="relative overflow-hidden p-4 sm:p-6 md:p-8">

          {/* STAGE VISUAL: Band Silhouette + Spotlights + 3D Podium */}
          <div className="relative w-full flex flex-col items-center justify-end min-h-[380px] sm:min-h-[460px] md:min-h-[520px]">
            
            {/* 1. UPWARD SPOTLIGHT BEAMS (Lampu yang menyorot dari panggung ke gambar - Bebas Lag) */}
            <div className="absolute inset-x-0 bottom-24 sm:bottom-28 md:bottom-32 h-[340px] sm:h-[420px] pointer-events-none z-10 flex justify-center items-end">
              {/* Left Angle Spotlight */}
              <div
                className="spotlight-beam-left absolute bottom-0 left-[22%] sm:left-[28%] w-32 sm:w-48 h-full opacity-60"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 100%, transparent 75deg, rgba(214, 180, 106, 0.08) 83deg, rgba(214, 180, 106, 0.3) 88deg, rgba(245, 216, 144, 0.65) 90deg, rgba(214, 180, 106, 0.3) 92deg, rgba(214, 180, 106, 0.08) 97deg, transparent 105deg)',
                }}
              />

              {/* Right Angle Spotlight */}
              <div
                className="spotlight-beam-right absolute bottom-0 right-[22%] sm:right-[28%] w-32 sm:w-48 h-full opacity-60"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 100%, transparent 75deg, rgba(214, 180, 106, 0.08) 83deg, rgba(214, 180, 106, 0.3) 88deg, rgba(245, 216, 144, 0.65) 90deg, rgba(214, 180, 106, 0.3) 92deg, rgba(214, 180, 106, 0.08) 97deg, transparent 105deg)',
                }}
              />

              {/* Center Direct Vertical Spotlight */}
              <div
                className="spotlight-beam-center absolute bottom-0 w-44 sm:w-64 h-full opacity-70"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 100%, transparent 80deg, rgba(214, 180, 106, 0.12) 85deg, rgba(214, 180, 106, 0.35) 88deg, rgba(245, 233, 211, 0.8) 90deg, rgba(214, 180, 106, 0.35) 92deg, rgba(214, 180, 106, 0.12) 95deg, transparent 100deg)',
                }}
              />
            </div>

            {/* 2. ROTATING BAND SILHOUETTE (Foto siluet tanpa background dengan 3D Concert Sway) */}
            <div className="relative z-30 flex flex-col items-center justify-center mb-[-50px] sm:mb-[-70px] md:mb-[-90px]">
              {/* Silhouette Wrapper with 3D Continuous Stage Sway Animation */}
              <div className="animate-band-sway cursor-pointer w-64 sm:w-80 md:w-96 lg:w-[460px] aspect-[16/10] flex items-center justify-center relative">
                <img
                  src="/images/band-silhouette.png"
                  alt={`Siluet Aksi ${band.name}`}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] select-none pointer-events-none"
                />
              </div>

              {/* Stage Glow Reflection under musicians feet */}
              <div className="w-56 sm:w-72 md:w-88 h-4 rounded-full bg-gradient-to-r from-transparent via-[#f5d890] to-transparent opacity-60" />
            </div>

            {/* 3. LUXURIOUS 3D CONCERT STAGE PODIUM (Ilustrasi Panggung Konser Teater Nyata SUPER HD) */}
            <div className="relative z-20 w-full max-w-3xl sm:max-w-4xl flex flex-col items-center select-none pointer-events-none mt-[-10px] sm:mt-[-16px] md:mt-[-20px]">
              <img
                src="/images/theatre-concert-podium-hd-clean.png"
                alt="Panggung Konser Teater 3D Memoria Super HD"
                className="w-full h-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.25)]"
              />
            </div>

          </div>

          {/* 4. BAND DETAILS CARD (Informasi Artis Bintang Band Tunggal) */}
          <div className="relative z-30 mt-8 pt-8 border-t border-memoria-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-memoria-dark-wine border border-memoria-gold/50 text-memoria-champagne text-xs uppercase tracking-widest shadow-xs">
                <Sparkle size={13} weight="fill" className="text-memoria-gold" />
                <span>Headliner Guest Star</span>
              </div>
              <h3
                style={{ fontFamily: 'var(--font-bodoni), serif' }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-memoria-dark-wine tracking-wide"
              >
                {band.name}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
                {band.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-50 border border-memoria-gold/40 text-memoria-dark-wine text-xs tracking-wider shadow-xs font-medium">
                <Disc size={18} className="text-memoria-gold animate-spin" style={{ animationDuration: '4s' }} />
                <span>Live Orchestral Band</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
