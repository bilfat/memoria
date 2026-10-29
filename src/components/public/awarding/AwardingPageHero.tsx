'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkle } from '@phosphor-icons/react';

interface AwardingPageHeroProps {
  title?: string;
  description?: string;
}

/**
 * AwardingPageHero
 * Golden Hall of Fame — Bright Luxury Header
 * - Pure, luminous white/ivory presentation (#FFFFFF & #FFFDF8)
 * - Typography: Bodoni Moda & DM Sans
 * - Color accents: Antique Gold (#D6B46A), Champagne (#EACFA4), Deep Gold (#A67B39), Main Text (#3E2418)
 * - GSAP Entrance Animation:
 *   1. Gold ornaments fade in smoothly
 *   2. Label "MEMORIA HALL OF HONOR" appears
 *   3. Heading masked text reveal
 *   4. Subtitle fades up
 *   5. Fine gold line expands from center
 */
export function AwardingPageHero({ title, description }: AwardingPageHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const headingTextRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dividerLineRef = useRef<HTMLDivElement>(null);
  const diamondAccentRef = useRef<HTMLDivElement>(null);

  const displayTitle = title || 'The Golden Moment';
  const displayDesc = description || 'Celebrating Excellence, Honoring Memories';

  useGSAP(
    () => {
      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set(
          [
            labelRef.current,
            headingTextRef.current,
            subtitleRef.current,
            dividerLineRef.current,
            diamondAccentRef.current,
          ],
          { opacity: 1, y: 0, scaleX: 1, scale: 1 }
        );
        return;
      }

      // Initial state
      gsap.set(labelRef.current, { opacity: 0, y: 15 });
      gsap.set(headingTextRef.current, { opacity: 0, y: 45 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      gsap.set(dividerLineRef.current, { scaleX: 0, opacity: 0 });
      gsap.set(diamondAccentRef.current, { scale: 0, opacity: 0, rotation: -45 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(labelRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.1,
      })
        .to(
          headingTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power4.out',
          },
          '-=0.4'
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          '-=0.5'
        )
        .to(
          dividerLineRef.current,
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power2.inOut',
          },
          '-=0.4'
        )
        .to(
          diamondAccentRef.current,
          {
            scale: 1,
            opacity: 1,
            rotation: 45,
            duration: 0.6,
            ease: 'back.out(2)',
          },
          '-=0.6'
        );
    },
    { scope: containerRef }
  );

  return (
    <header
      ref={containerRef}
      className="text-center max-w-4xl mx-auto pt-4 sm:pt-8 mb-16 sm:mb-24 select-none relative z-20"
    >


      {/* 2. Heading: Masked / Cinematic Reveal */}
      <div ref={headingWrapperRef} className="overflow-hidden py-1">
        <h1
          ref={headingTextRef}
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#3E2418] mb-4 leading-[1.14] break-words drop-shadow-[0_2px_10px_rgba(62,36,24,0.06)]"
        >
          {displayTitle}
        </h1>
      </div>

      {/* 3. Subtitle: DM Sans Fade-up */}
      <p
        ref={subtitleRef}
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-base sm:text-lg md:text-xl text-[#7B6050] font-normal leading-relaxed max-w-2xl mx-auto px-4"
      >
        {displayDesc}
      </p>

      {/* 4. Delicate Gold Line Divider Expanding from Center */}
      <div className="w-48 sm:w-64 h-[1.5px] mx-auto mt-7 sm:mt-8 relative flex items-center justify-center">
        <div
          ref={dividerLineRef}
          className="w-full h-full bg-gradient-to-r from-transparent via-[#D6B46A] to-transparent origin-center"
        />
        <div
          ref={diamondAccentRef}
          className="absolute w-2.5 h-2.5 bg-gradient-to-br from-[#FFFDF8] via-[#EACFA4] to-[#D6B46A] border border-[#A67B39] shadow-[0_0_8px_rgba(214,180,106,0.65)]"
        />
      </div>
    </header>
  );
}
