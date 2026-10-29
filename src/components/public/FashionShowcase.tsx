'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EventContent } from '@/types';
import { FashionStage } from './fashion/FashionStage';
import { FashionEditorialContent } from './fashion/FashionEditorialContent';

interface FashionShowcaseProps {
  event: EventContent;
}

export function FashionShowcase({ event }: FashionShowcaseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const lightingRigRef = useRef<HTMLDivElement>(null);
  const spotlightsRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const lightSweepRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [hasTriggered, setHasTriggered] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // IntersectionObserver untuk memicu animasi saat section masuk ke viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Jika skipIntro diminta atau reduced motion, langsung aktifkan
    if (
      window.location.search.includes('skipIntro=1') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasTriggered(true);
        }
      },
      {
        rootMargin: '120px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // GSAP Animation Sequence: The Velvet Runway
  useGSAP(
    () => {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSkipParam =
        typeof window !== 'undefined' &&
        window.location.search.includes('skipIntro=1');

      // Jika reduced motion atau skip param aktif, langsung tampilkan semua elemen dalam posisi final
      if (prefersReduced || isSkipParam) {
        if (lightingRigRef.current) gsap.set(lightingRigRef.current, { opacity: 1, y: 0 });
        if (spotlightsRef.current) gsap.set(spotlightsRef.current, { opacity: 1, scaleY: 1 });
        if (modelRef.current) gsap.set(modelRef.current, { opacity: 1, y: 0, scale: 1 });
        gsap.set('.fashion-edge-light', { opacity: 1 });
        gsap.set('.fashion-rig-bulb', { opacity: 1 });
        gsap.set('.fashion-content-item', { opacity: 1, y: 0 });
        return;
      }

      // Initial State (Sebelum Trigger)
      if (lightingRigRef.current) gsap.set(lightingRigRef.current, { opacity: 0, y: -40 });
      if (spotlightsRef.current) gsap.set(spotlightsRef.current, { opacity: 0, scaleY: 0.65 });
      if (modelRef.current) gsap.set(modelRef.current, { opacity: 0, y: 45, scale: 0.9 });
      gsap.set('.fashion-edge-light', { opacity: 0.3 });
      gsap.set('.fashion-rig-bulb', { opacity: 0.25 });
      gsap.set('.fashion-content-item', { opacity: 0, y: 25 });

      if (!hasTriggered) return;

      // Kill previous timeline jika ada
      if (timelineRef.current) timelineRef.current.kill();

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      timelineRef.current = tl;

      // =========================================================
      // SCENE A: Overhead Linear Lighting Rig Entrance
      // =========================================================
      tl.to(lightingRigRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      })

      // =========================================================
      // SCENE B: Runway Edge Lights Sequential Activation (Back to Front)
      // =========================================================
      .to(
        '.fashion-edge-light',
        {
          opacity: 1,
          stagger: {
            each: 0.05,
            from: 'start',
          },
          duration: 0.6,
          ease: 'power2.inOut',
        },
        '-=0.6'
      )
      .to(
        '.fashion-rig-bulb',
        {
          opacity: 1,
          stagger: {
            each: 0.04,
            from: 'center',
          },
          duration: 0.5,
          ease: 'power2.inOut',
        },
        '-=0.5'
      )

      // =========================================================
      // SCENE C: Volumetric Runway Spotlights Power Up
      // =========================================================
      .to(
        spotlightsRef.current,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.9,
          ease: 'power2.out',
        },
        '-=0.4'
      )

      // =========================================================
      // SCENE D: Model Entrance (Depth Walk down the catwalk)
      // =========================================================
      .to(
        modelRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.3,
          ease: 'power3.out',
        },
        '-=0.6'
      )

      // =========================================================
      // SCENE E: Golden Gown Light Sweep
      // =========================================================
      .fromTo(
        lightSweepRef.current,
        {
          xPercent: -120,
          opacity: 0,
        },
        {
          xPercent: 180,
          opacity: 0.85,
          duration: 0.85,
          ease: 'power2.inOut',
          onComplete: () => {
            if (lightSweepRef.current) {
              gsap.to(lightSweepRef.current, { opacity: 0, duration: 0.3 });
            }
          },
        },
        '-=0.4'
      )

      // =========================================================
      // SCENE F: Editorial Content Reveal
      // =========================================================
      .to(
        '.fashion-content-item',
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      );
    },
    { dependencies: [hasTriggered], scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="fashion-showcase"
      aria-label="Panggung Runway Fashion Show The Velvet Runway MEMORIA"
      className="relative w-full py-16 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#d6b46a]/30"
    >
      {/* Runway Stage Ambient Warm Glow */}
      <div className="absolute top-1/2 left-[8%] -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(181,39,53,0.08)_0%,_transparent_70%)] blur-3xl pointer-events-none" />

      {/* Main Responsive Alternating Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* SISI KIRI: ANIMATED RUNWAY STAGE (58% Dominan Visual di Desktop, Atas di Mobile) */}
          <div className="lg:col-span-7 order-1 lg:order-1 w-full">
            <FashionStage
              lightingRigRef={lightingRigRef}
              spotlightsRef={spotlightsRef}
              modelRef={modelRef}
              lightSweepRef={lightSweepRef}
              customImage="/images/fashion-model-clean.png"
            />
          </div>

          {/* SISI KANAN: EDITORIAL INFORMATION (42% Area di Desktop, Bawah di Mobile) */}
          <div className="lg:col-span-5 order-2 lg:order-2 px-2 sm:px-4">
            <FashionEditorialContent
              title={event.fashionTeaser?.title || 'The Runway Experience'}
              description={event.fashionTeaser?.description}
              contentRef={contentRef}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
