'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EventContent } from '@/types';
import { BrandLogotype } from './BrandLogotype';
import { calculateCountdown, formatWibDateOnly, formatWibTimeOnly, CountdownTime } from '@/lib/date';
import { CalendarBlank, MapPin, Sparkle, Ticket } from '@phosphor-icons/react';

interface TheatreStageHeroProps {
  event: EventContent;
}

export function TheatreStageHero({ event }: TheatreStageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const [curtainsOpened, setCurtainsOpened] = useState(false);

  // Live countdown timer tick
  useEffect(() => {
    setCountdown(calculateCountdown(event.eventStartAt));
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(event.eventStartAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [event.eventStartAt]);

  // GSAP Curtain Opening Animation
  useGSAP(
    () => {
      // Check reduced motion
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        if (leftCurtainRef.current) leftCurtainRef.current.style.transform = 'translateX(-100%)';
        if (rightCurtainRef.current) rightCurtainRef.current.style.transform = 'translateX(100%)';
        if (heroContentRef.current) heroContentRef.current.style.opacity = '1';
        if (spotlightRef.current) spotlightRef.current.style.opacity = '0.8';
        setCurtainsOpened(true);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => setCurtainsOpened(true),
      });

      // Step 1: Marquee bulbs warm up and flicker
      tl.fromTo(
        '.marquee-bulb',
        { opacity: 0.2, scale: 0.8 },
        { opacity: 1, scale: 1, stagger: 0.04, duration: 0.8, ease: 'power2.out' }
      )
        // Step 2: Velvet curtains smoothly open to the sides
        .to(
          leftCurtainRef.current,
          {
            xPercent: -100,
            duration: 2.2,
            ease: 'power3.inOut',
          },
          '+=0.2'
        )
        .to(
          rightCurtainRef.current,
          {
            xPercent: 100,
            duration: 2.2,
            ease: 'power3.inOut',
          },
          '<'
        )
        // Step 3: Spotlight shines down on the stage
        .to(
          spotlightRef.current,
          {
            opacity: 0.85,
            scaleY: 1,
            duration: 1.4,
            ease: 'power2.out',
          },
          '-=1.4'
        )
        // Step 4: Hero Content reveals inside the theatre
        .fromTo(
          heroContentRef.current,
          { opacity: 0, y: 35, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.8'
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-memoria-midnight border-b border-memoria-gold/30 select-none"
    >
      {/* 1. Backdrop Ambient Texture & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-memoria-dark-wine via-memoria-midnight to-[#0d0405] z-0" />

      {/* 2. Overhead Spotlight Beam (Radial cone from top) */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-full opacity-0 pointer-events-none z-10"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, transparent 40%, rgba(214,180,106,0.18) 48%, rgba(245,233,211,0.28) 50%, rgba(214,180,106,0.18) 52%, transparent 60%)',
        }}
      />

      {/* 3. Proscenium Arch & Perimeter Marquee Lights */}
      <div
        ref={marqueeRef}
        className="absolute inset-x-2 sm:inset-x-8 top-2 bottom-0 pointer-events-none z-30 rounded-t-[40px] sm:rounded-t-[80px] border-t-4 border-x-4 border-memoria-gold/60 shadow-[inset_0_0_50px_rgba(137,21,35,0.4)]"
      >
        {/* Top Marquee Bulbs Row */}
        <div className="absolute top-1 inset-x-4 flex justify-around items-center px-4">
          {[...Array(18)].map((_, i) => (
            <div
              key={`bulb-${i}`}
              className="marquee-bulb w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-memoria-champagne border border-memoria-gold shadow-[0_0_12px_rgba(214,180,106,0.9)] animate-marquee-glow"
              style={{ animationDelay: `${(i % 5) * 0.4}s` }}
            />
          ))}
        </div>
      </div>

      {/* 4. Multi-tier Stage Podium at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 pointer-events-none z-20 flex flex-col items-center justify-end">
        {/* Upper step */}
        <div className="w-[85vw] max-w-5xl h-8 bg-gradient-to-r from-memoria-dark-wine via-memoria-burgundy to-memoria-dark-wine border-t-2 border-memoria-gold/70 rounded-t-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)]" />
        {/* Lower step */}
        <div className="w-[95vw] max-w-6xl h-12 bg-gradient-to-r from-[#200508] via-memoria-dark-wine to-[#200508] border-t border-memoria-gold/40 shadow-2xl flex items-center justify-center">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-memoria-gold/40 to-transparent" />
        </div>
      </div>

      {/* 5. DUAL VELVET CURTAINS (Left & Right) */}
      {/* Left Curtain */}
      <div
        ref={leftCurtainRef}
        className="absolute inset-y-0 left-0 w-1/2 z-40 origin-left flex shadow-2xl"
        style={{
          background:
            'repeating-linear-gradient(90deg, #660e18 0px, #891523 25px, #b52735 45px, #660e18 70px)',
          boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.8), 10px 0 30px rgba(0,0,0,0.9)',
        }}
      >
        {/* Golden curtain trim tassels */}
        <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-b from-memoria-gold via-memoria-champagne to-memoria-copper shadow-md opacity-80" />
      </div>

      {/* Right Curtain */}
      <div
        ref={rightCurtainRef}
        className="absolute inset-y-0 right-0 w-1/2 z-40 origin-right flex shadow-2xl"
        style={{
          background:
            'repeating-linear-gradient(90deg, #660e18 0px, #891523 25px, #b52735 45px, #660e18 70px)',
          boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.8), -10px 0 30px rgba(0,0,0,0.9)',
        }}
      >
        {/* Golden curtain trim tassels */}
        <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-b from-memoria-gold via-memoria-champagne to-memoria-copper shadow-md opacity-80" />
      </div>

      {/* 6. HERO CONTENT CENTERSTAGE (Revealed when curtains open) */}
      <div
        ref={heroContentRef}
        className="relative z-25 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6 py-16"
      >
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/50 text-memoria-champagne text-xs sm:text-sm tracking-[0.25em] uppercase shadow-lg">
          <Sparkle size={15} weight="fill" className="text-memoria-gold" />
          <span>{event.tagline}</span>
        </div>

        {/* Signature Brand Wordmark */}
        <BrandLogotype size="hero" showSubtitle={false} />

        {/* Description */}
        <p className="max-w-2xl text-sm sm:text-base text-memoria-ivory/90 leading-relaxed font-normal px-2">
          {event.description}
        </p>

        {/* Event Schedule & Venue Card */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-6 rounded-2xl bg-memoria-dark-wine/60 border border-memoria-gold/30 text-xs sm:text-sm text-memoria-champagne shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CalendarBlank size={18} weight="bold" className="text-memoria-gold shrink-0" />
            <span>
              {formatWibDateOnly(event.eventStartAt)} • {formatWibTimeOnly(event.eventStartAt)}
            </span>
          </div>
          <span className="hidden sm:inline text-memoria-gold/40">|</span>
          <div className="flex items-center gap-2">
            <MapPin size={18} weight="bold" className="text-memoria-gold shrink-0" />
            <span>{event.venueName}</span>
          </div>
        </div>

        {/* LIVE COUNTDOWN TIMER */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="text-[11px] tracking-[0.2em] uppercase text-memoria-gold/80 font-semibold">
            {countdown.isPast ? 'Acara Telah Dimulai' : 'Menuju Malam Puncak'}
          </div>
          {!countdown.isPast ? (
            <div className="flex items-center gap-2.5 sm:gap-4 font-mono">
              {[
                { label: 'HARI', val: countdown.days },
                { label: 'JAM', val: countdown.hours },
                { label: 'MENIT', val: countdown.minutes },
                { label: 'DETIK', val: countdown.seconds },
              ].map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center justify-center w-14 sm:w-20 h-16 sm:h-20 rounded-xl bg-gradient-to-b from-[#24080b] to-[#140406] border border-memoria-gold/40 shadow-inner">
                    <span className="text-xl sm:text-3xl font-bold text-memoria-ivory tabular-nums">
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] tracking-wider text-memoria-champagne/70 font-sans mt-0.5">
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && <span className="text-xl sm:text-2xl font-bold text-memoria-gold/60">:</span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="py-2 px-6 rounded-full bg-memoria-burgundy/80 text-memoria-ivory font-bold text-sm tracking-wider border border-memoria-gold/40">
              Pertunjukan Teater Sedang Berlangsung
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/daftar"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red text-memoria-ivory font-bold text-sm tracking-wider shadow-[0_6px_25px_rgba(137,21,35,0.7)] border border-memoria-gold/70 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Ticket size={20} weight="fill" className="text-memoria-champagne" />
            <span>PILIH TIKET GRATIS</span>
          </Link>
          <a
            href="#lineup-band"
            className="px-6 py-3.5 rounded-full bg-memoria-dark-wine/80 text-memoria-champagne font-medium text-sm tracking-wider border border-memoria-gold/30 hover:bg-memoria-dark-wine hover:border-memoria-gold transition-colors"
          >
            Lihat Lineup Band
          </a>
        </div>
      </div>
    </div>
  );
}
