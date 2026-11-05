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

      // Initial State (Sebelum Trigger) - Menggunakan force3D untuk rendering GPU instan
      if (lightRigRef.current) gsap.set(lightRigRef.current, { opacity: 0, y: -30, force3D: true });
      if (spotlightRef.current) gsap.set(spotlightRef.current, { opacity: 0, scaleY: 0.75, force3D: true });
      if (trophyRef.current) gsap.set(trophyRef.current, { opacity: 0, y: 25, scale: 0.95, force3D: true });
      gsap.set('.awarding-rig-bulb', { opacity: 0.4 });
      gsap.set('.awarding-content-item', { opacity: 0, y: 18 });

      if (!hasTriggered) return;

      // Kill previous timeline jika ada
      if (timelineRef.current) timelineRef.current.kill();

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', force3D: true },
      });

      timelineRef.current = tl;

      // =========================================================
      // SCENE A: Entrance (Overhead circular lighting turun mulus)
      // =========================================================
      tl.to(lightRigRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power2.out',
      })

      // =========================================================
      // SCENE B: Lighting Activation (Lampu ring menyala & spotlight menguat)
      // =========================================================
      .to(
        '.awarding-rig-bulb',
        {
          opacity: 1,
          stagger: {
            each: 0.015,
            from: 'center',
          },
          duration: 0.35,
          ease: 'power1.out',
        },
        '-=0.35'
      )
      .to(
        spotlightRef.current,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.65,
          ease: 'power2.out',
        },
        '-=0.3'
      )

      // =========================================================
      // SCENE C: Trophy Reveal (Trophy naik proporsional dan anggun)
      // =========================================================
      .to(
        trophyRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
        },
        '-=0.45'
      )

      // =========================================================
      // SCENE D: Golden Shine (Light sweep cepat dan berkilau)
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
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (lightSweepRef.current) {
              gsap.to(lightSweepRef.current, { opacity: 0, duration: 0.25 });
            }
          },
        },
        '-=0.3'
      )

      // =========================================================
      // SCENE E: Text Reveal (Badge, Judul, Deskripsi, Tombol masuk)
      // =========================================================
      .to(
        '.awarding-content-item',
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.55,
          ease: 'power2.out',
        },
        '-=0.4'
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
          <div data-scroll-stagger="left" className="lg:col-span-5 order-2 lg:order-1 px-2 sm:px-4">
            <AwardingContent
              title={event.awardingTeaser.title || 'The Golden Moment'}
              description={event.awardingTeaser.description}
              contentRef={contentRef}
            />
          </div>

          {/* SISI KANAN: ANIMATED AWARD STAGE (55% Dominan Visual di Desktop) */}
          <div data-scroll-stagger="right" className="lg:col-span-7 order-1 lg:order-2 w-full">
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
