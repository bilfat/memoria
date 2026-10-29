'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check, Sparkle } from '@phosphor-icons/react';

/**
 * GoldenSealAnimation
 * Komponen animasi segel emas teatrikal (Golden Seal: Your Vote Has Been Sealed):
 * 1. Stamping entrance dengan scale bounce
 * 2. Golden light sweep yang menyapu berkilau melewati permukaan segel
 * 3. Ikon centang emas muncul di tengah segel dengan pendaran cahaya
 */
export function GoldenSealAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sealRef.current) return;

      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set(sealRef.current, { scale: 1, opacity: 1, rotate: 0 });
        if (checkRef.current) gsap.set(checkRef.current, { scale: 1, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Scene 1 & 2: Stamping Entrance (Scale Bounce & Subtle Rotation)
      tl.fromTo(
        sealRef.current,
        {
          scale: 0.5,
          opacity: 0,
          rotate: -12,
        },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.8,
          ease: 'back.out(2)',
        }
      )

      // Scene 3: Golden Light Sweep melewati segel
      .fromTo(
        sweepRef.current,
        {
          xPercent: -150,
          opacity: 0,
        },
        {
          xPercent: 180,
          opacity: 0.9,
          duration: 0.7,
          ease: 'power2.inOut',
          onComplete: () => {
            if (sweepRef.current) {
              gsap.to(sweepRef.current, { opacity: 0, duration: 0.2 });
            }
          },
        },
        '-=0.3'
      )

      // Scene 4: Checkmark Reveal
      .fromTo(
        checkRef.current,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2.5)',
        },
        '-=0.3'
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative flex items-center justify-center my-4 select-none">
      {/* Golden Ambient Aura Blur */}
      <div className="absolute w-36 h-36 rounded-full bg-[radial-gradient(circle,_rgba(214,180,106,0.5)_0%,_rgba(245,216,144,0.2)_50%,_transparent_75%)] blur-xl pointer-events-none animate-pulse" />

      {/* Main Golden Seal Medal */}
      <div
        ref={sealRef}
        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 shadow-[0_0_50px_rgba(214,180,106,0.65),0_10px_25px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #d6b46a 0%, #fff2cc 28%, #b38b38 52%, #f5d890 75%, #8a6520 100%)',
        }}
      >
        {/* Inner Wax Texture Rim */}
        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2a0b10] via-[#1b0609] to-[#120305] border-2 border-[#f5d890] flex items-center justify-center relative overflow-hidden shadow-inner">
          
          {/* Concentric Decorative Rings */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#d6b46a]/50 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-[#f5d890]/30 pointer-events-none" />

          {/* Golden Light Sweep Overlay */}
          <div
            ref={sweepRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.8) 50%, transparent 75%)',
            }}
          />

          {/* MEMORIA Arc Text / Monogram */}
          <div className="absolute top-2.5 inset-x-0 text-center pointer-events-none">
            <span className="text-[8px] font-mono tracking-[0.28em] text-[#d6b46a] font-bold uppercase">
              ★ MEMORIA SEAL ★
            </span>
          </div>

          {/* Success Checkmark & Glow */}
          <div
            ref={checkRef}
            className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#d6b46a] via-[#fef08a] to-[#d6b46a] text-[#140809] flex items-center justify-center shadow-[0_0_20px_rgba(254,240,138,0.9)]"
          >
            <Check size={28} weight="bold" />
          </div>

          {/* Bottom Arc Text */}
          <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none">
            <span className="text-[7.5px] font-mono tracking-[0.25em] text-[#eacfa4]/80 uppercase">
              OFFICIAL BALLOT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
