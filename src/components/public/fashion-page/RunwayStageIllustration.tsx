'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * RunwayStageIllustration
 * Ilustrasi Runway Catwalk 3D Berlapis dengan Animasi GSAP:
 * - Jalur runway memanjang ke arah depan dengan perspektif 3D yang dinamis
 * - Garis pembatas emas halus (gold edge trims) di sisi catwalk
 * - Tirai velvet burgundy teater di sisi belakang
 * - Linear overhead lighting rig dengan deretan lampu spotlight
 * - Berkas cahaya spotlight bergerak (moving spotlight sweep) menyapu jalur runway
 * - Refleksi hangat dan kedalaman material beludru
 */
export function RunwayStageIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const runwayFloorRef = useRef<HTMLDivElement>(null);
  const lightRigRef = useRef<HTMLDivElement>(null);
  const spotlightSweepRef = useRef<HTMLDivElement>(null);
  const edgeBulbsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set(
          [
            runwayFloorRef.current,
            lightRigRef.current,
            spotlightSweepRef.current,
            edgeBulbsRef.current,
          ],
          { opacity: 1, scale: 1, y: 0 }
        );
        if (leftCurtainRef.current) gsap.set(leftCurtainRef.current, { xPercent: -20 });
        if (rightCurtainRef.current) gsap.set(rightCurtainRef.current, { xPercent: 20 });
        return;
      }

      // Initial States
      gsap.set(runwayFloorRef.current, { opacity: 0, scaleY: 0.8, y: 30, transformOrigin: 'bottom center' });
      gsap.set(lightRigRef.current, { opacity: 0, y: -25 });
      gsap.set(edgeBulbsRef.current, { opacity: 0 });
      gsap.set(spotlightSweepRef.current, { opacity: 0, x: -120 });
      if (leftCurtainRef.current) gsap.set(leftCurtainRef.current, { xPercent: 0 });
      if (rightCurtainRef.current) gsap.set(rightCurtainRef.current, { xPercent: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Scene 2: Velvet Reveal — Tirai terbuka anggun sedikit ke samping
      tl.to([leftCurtainRef.current, rightCurtainRef.current], {
        xPercent: (i) => (i === 0 ? -22 : 22),
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.2,
      })
        // Scene 2b: Runway Floor Reveal
        .to(
          runwayFloorRef.current,
          {
            opacity: 1,
            scaleY: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
          },
          '-=1.0'
        )
        // Scene 3: Overhead Rig & Edge Bulbs Illumination
        .to(
          lightRigRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.7'
        )
        .to(
          edgeBulbsRef.current,
          {
            opacity: 1,
            duration: 0.7,
            stagger: 0.05,
          },
          '-=0.5'
        )
        // Scene 3b: Moving Spotlight Sweep across runway
        .to(
          spotlightSweepRef.current,
          {
            opacity: 0.9,
            x: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          '-=0.6'
        )
        .to(
          spotlightSweepRef.current,
          {
            x: 80,
            duration: 1.4,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true,
          }
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-[16/11] mx-auto rounded-3xl bg-gradient-to-b from-[#180508] via-[#2A080E] to-[#120305] p-3 sm:p-5 shadow-[0_20px_60px_rgba(53,10,16,0.35),0_4px_16px_rgba(0,0,0,0.25)] border border-[#D6B46A]/30 overflow-hidden select-none"
    >
      {/* 1. Background Arch & Soft Atmosphere Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(214,180,106,0.2)_0%,_rgba(137,21,35,0.25)_45%,_transparent_75%)] pointer-events-none" />

      {/* 2. Velvet Theatre Curtains at Rear (Backdrop Folds) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Left Velvet Curtain */}
        <div
          ref={leftCurtainRef}
          className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1E0407] via-[#520D16] to-[#891523]/80 border-r border-[#D6B46A]/30 shadow-2xl"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.5) 0px, transparent 14px, rgba(137,21,35,0.4) 28px)',
          }}
        />
        {/* Right Velvet Curtain */}
        <div
          ref={rightCurtainRef}
          className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#1E0407] via-[#520D16] to-[#891523]/80 border-l border-[#D6B46A]/30 shadow-2xl"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(137,21,35,0.4) 0px, transparent 14px, rgba(0,0,0,0.5) 28px)',
          }}
        />
      </div>

      {/* 3. Overhead Linear Lighting Rig with Mini Spotlights */}
      <div
        ref={lightRigRef}
        className="absolute top-2 inset-x-8 sm:inset-x-12 z-30 pointer-events-none flex flex-col items-center"
      >
        {/* Metal Truss Bar */}
        <div className="w-full h-2.5 bg-gradient-to-r from-[#2B1A12] via-[#EACFA4] to-[#2B1A12] rounded-full border-t border-[#FFFDF8]/40 shadow-md flex items-center justify-around px-4">
          {/* Mini Spotlights along Truss */}
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="relative flex flex-col items-center">
              <div className="w-2.5 h-3 bg-[#1A0406] border border-[#D6B46A]/60 rounded-b-sm -mt-0.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFFDF0] shadow-[0_0_8px_#F5D890] -mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Moving Catwalk Spotlight Beam */}
      <div
        ref={spotlightSweepRef}
        className="absolute top-3 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-[92%] z-20 pointer-events-none"
        style={{
          clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
          background: `
            linear-gradient(
              180deg,
              rgba(255, 253, 240, 0.75) 0%,
              rgba(245, 216, 144, 0.45) 30%,
              rgba(214, 180, 106, 0.22) 65%,
              transparent 100%
            )
          `,
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 5. 3D PERSPECTIVE RUNWAY CATWALK (Lantai Runway ke Depan) */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none z-15"
        style={{ perspective: '600px' }}
      >
        <div
          ref={runwayFloorRef}
          className="relative w-44 xs:w-56 sm:w-68 md:w-76 h-[85%] mb-0.5 flex flex-col items-center shadow-[0_-10px_35px_rgba(0,0,0,0.95)]"
          style={{
            transform: 'rotateX(38deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Main Catwalk Surface with High-Gloss Velvet Reflections */}
          <div className="w-full h-full bg-gradient-to-b from-[#350A10] via-[#891523] to-[#250509] border-x-2 border-[#F5D890] rounded-t-xl relative overflow-hidden shadow-2xl">
            {/* Gloss Center Line Reflection */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-[#FFFDF8]/20 to-transparent blur-[2px]" />

            {/* Front Stage Edge Trim */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F5D890] to-transparent" />

            {/* Subtle Catwalk Plank Horizontal Dividers */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-35">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5D890]/50 to-transparent" />
              ))}
            </div>

            {/* Stage Front Rim Accent */}
            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          {/* Runway Side Edge Lights (Lampu Bohlam Mini Sisi Catwalk) */}
          <div
            ref={edgeBulbsRef}
            className="absolute inset-0 flex justify-between px-1.5 py-3 pointer-events-none"
          >
            {/* Left Edge Bulbs */}
            <div className="flex flex-col justify-between h-full">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`left-${i}`}
                  className="w-2 h-2 rounded-full bg-[#FFFDF0] shadow-[0_0_8px_#F5D890] border border-[#A67B39]"
                />
              ))}
            </div>
            {/* Right Edge Bulbs */}
            <div className="flex flex-col justify-between h-full">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`right-${i}`}
                  className="w-2 h-2 rounded-full bg-[#FFFDF0] shadow-[0_0_8px_#F5D890] border border-[#A67B39]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Front Footlight Reflection Bar */}
      <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-[#140809] to-transparent border-t border-[#D6B46A]/40 flex items-center justify-center z-25">
        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#D6B46A]/80 font-bold">
          PANGGUNG FASHION SHOW • TELKOM UNIVERSITY
        </span>
      </div>
    </div>
  );
}

