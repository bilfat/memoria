'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EventContent } from '@/types';
import { AwardingStage } from './awarding/AwardingStage';
import { AwardingContent } from './awarding/AwardingContent';

interface AwardingShowcaseProps {
  event: EventContent;
}

export function AwardingShowcase({ event }: AwardingShowcaseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const lightRigRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
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

  // GSAP Animation Sequence: The Golden Spotlight Ceremony
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
        if (lightRigRef.current) gsap.set(lightRigRef.current, { opacity: 1, y: 0 });
        if (spotlightRef.current) gsap.set(spotlightRef.current, { opacity: 1, scaleY: 1 });
        if (trophyRef.current) gsap.set(trophyRef.current, { opacity: 1, y: 0, scale: 1 });
        gsap.set('.awarding-rig-bulb', { opacity: 1 });
        gsap.set('.awarding-content-item', { opacity: 1, y: 0 });
        return;
      }

      // Initial State (Sebelum Trigger)
      if (lightRigRef.current) gsap.set(lightRigRef.current, { opacity: 0, y: -45 });
      if (spotlightRef.current) gsap.set(spotlightRef.current, { opacity: 0, scaleY: 0.65 });
      if (trophyRef.current) gsap.set(trophyRef.current, { opacity: 0, y: 40, scale: 0.93 });
      gsap.set('.awarding-rig-bulb', { opacity: 0.25 });
      gsap.set('.awarding-content-item', { opacity: 0, y: 25 });

      if (!hasTriggered) return;

      // Kill previous timeline jika ada
      if (timelineRef.current) timelineRef.current.kill();

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      timelineRef.current = tl;

      // =========================================================
      // SCENE A: Entrance (Overhead circular lighting turun perlahan)
      // =========================================================
      tl.to(lightRigRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      })

      // =========================================================
      // SCENE B: Lighting Activation (Lampu ring menyala & spotlight menguat)
      // =========================================================
      .to(
        '.awarding-rig-bulb',
        {
          opacity: 1,
          stagger: {
            each: 0.035,
            from: 'center',
          },
          duration: 0.5,
          ease: 'power2.inOut',
        },
        '-=0.5'
      )
      .to(
        spotlightRef.current,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.9,
          ease: 'power2.out',
        },
        '-=0.4'
      )

      // =========================================================
      // SCENE C: Trophy Reveal (Trophy naik perlahan dari pedestal)
      // =========================================================
      .to(
        trophyRef.current,
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
      // SCENE D: Golden Shine (Light sweep bergerak melewati permukaan trophy)
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
      // SCENE E: Text Reveal (Badge, Judul, Deskripsi, Tombol masuk)
      // =========================================================
      .to(
        '.awarding-content-item',
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
      id="awarding-showcase"
      aria-label="Panggung Penghargaan The Golden Moment Awarding MEMORIA"
      className="relative w-full py-16 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#d6b46a]/30"
    >
      {/* Golden Stage Ambient Dust Glow */}
      <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(214,180,106,0.08)_0%,_transparent_70%)] blur-3xl pointer-events-none" />

      {/* Main Responsive Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* SISI KIRI: EDITORIAL INFORMATION (45% Area di Desktop) */}
          <div className="lg:col-span-5 order-2 lg:order-1 px-2 sm:px-4">
            <AwardingContent
              title={event.awardingTeaser.title || 'The Golden Moment'}
              description={event.awardingTeaser.description}
              contentRef={contentRef}
            />
          </div>

          {/* SISI KANAN: ANIMATED AWARD STAGE (55% Dominan Visual di Desktop) */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <AwardingStage
              lightRigRef={lightRigRef}
              spotlightRef={spotlightRef}
              trophyRef={trophyRef}
              lightSweepRef={lightSweepRef}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
