'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EventContent } from '@/types';
import { TheatreArchFrame } from './TheatreArchFrame';
import { TheatreCurtains } from './TheatreCurtains';
import { StagePlatform } from './StagePlatform';
import { TheatreCountdown } from './TheatreCountdown';
import { calculateCountdown, formatWibDateOnly, formatWibTimeOnly, CountdownTime } from '@/lib/date';
import { Clock, MapPin, ArrowClockwise, FastForward } from '@phosphor-icons/react';

interface TheatreStageHeroProps {
  event: EventContent;
}

export function TheatreStageHero({ event }: TheatreStageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const memoriaTitleRef = useRef<HTMLDivElement>(null);
  const eventInfoRef = useRef<HTMLDivElement>(null);
  const countdownSectionRef = useRef<HTMLDivElement>(null);

  const [isIntroRunning, setIsIntroRunning] = useState(false);
  const [curtainsOpened, setCurtainsOpened] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    status: 'UPCOMING',
  });

  // Sinkronisasi realtime countdown timer dengan throttling ramah baterai & tab switching
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const tick = () => {
      setCountdown(calculateCountdown(event.eventStartAt));
    };

    const startTimer = () => {
      tick();
      if (!interval) {
        interval = setInterval(tick, 1000);
      }
    };

    const stopTimer = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    startTimer();

    const handleVisibility = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [event.eventStartAt]);

  // Fungsi untuk menjalankan animasi panggung GSAP
  const playIntroAnimation = useCallback((forceReplay = false) => {
    const isSkipParam = typeof window !== 'undefined' && window.location.search.includes('skipIntro=1');

    // Jika skip param eksplisit diminta (dan bukan force replay)
    if (isSkipParam && !forceReplay) {
      if (leftCurtainRef.current) gsap.set(leftCurtainRef.current, { xPercent: -100 });
      if (rightCurtainRef.current) gsap.set(rightCurtainRef.current, { xPercent: 100 });
      if (spotlightRef.current) gsap.set(spotlightRef.current, { opacity: 0.9, scaleY: 1 });
      if (memoriaTitleRef.current) gsap.set(memoriaTitleRef.current, { opacity: 1, y: 0, scale: 1 });
      if (eventInfoRef.current) gsap.set(eventInfoRef.current, { opacity: 1, y: 0 });
      if (countdownSectionRef.current) gsap.set(countdownSectionRef.current, { opacity: 1 });
      gsap.set('.stage-marquee-bulb', { opacity: 1, scale: 1 });
      gsap.set('.marquee-countdown-box', { opacity: 1, y: 0, scale: 1 });
      setCurtainsOpened(true);
      setIsIntroRunning(false);
      return;
    }

    // Kill existing timeline jika ada
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setIsIntroRunning(true);
    setCurtainsOpened(false);

    // Initial Scene 01 Setup: Tirai BENAR-BENAR MENUTUP DI TENGAH (0%)
    if (leftCurtainRef.current) gsap.set(leftCurtainRef.current, { xPercent: 0, opacity: 1 });
    if (rightCurtainRef.current) gsap.set(rightCurtainRef.current, { xPercent: 0, opacity: 1 });
    if (spotlightRef.current) gsap.set(spotlightRef.current, { opacity: 0, scaleY: 0.6 });
    if (memoriaTitleRef.current) gsap.set(memoriaTitleRef.current, { opacity: 0, y: 35, scale: 0.92 });
    if (eventInfoRef.current) gsap.set(eventInfoRef.current, { opacity: 0, y: 25 });
    if (countdownSectionRef.current) gsap.set(countdownSectionRef.current, { opacity: 0 });
    gsap.set('.marquee-countdown-box', { opacity: 0, y: 30, scale: 0.95 });
    gsap.set('.stage-marquee-bulb', { opacity: 0.25, scale: 0.85 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        setCurtainsOpened(true);
        setIsIntroRunning(false);
      },
    });

    timelineRef.current = tl;

    // SCENE 02: Marquee lights warm up and illuminate sequentially
    tl.to(
      '.stage-marquee-bulb',
      {
        opacity: 1,
        scale: 1,
        stagger: {
          from: 'center',
          each: 0.02,
        },
        duration: 0.8,
        ease: 'power2.out',
      },
      '+=0.1'
    )
      // SCENE 03: Velvet curtains smoothly open to sides from the center
      .to(
        leftCurtainRef.current,
        {
          xPercent: -100,
          duration: 2.4,
          ease: 'power3.inOut',
        },
        '+=0.05'
      )
      .to(
        rightCurtainRef.current,
        {
          xPercent: 100,
          duration: 2.4,
          ease: 'power3.inOut',
        },
        '<'
      )
      // Spotlight illuminates stage smoothly
      .to(
        spotlightRef.current,
        {
          opacity: 0.95,
          scaleY: 1,
          duration: 1.8,
          ease: 'power2.out',
        },
        '-=1.8'
      )
      // SCENE 04: Main Brand Title MEMORIA reveal with graceful rise
      .to(
        memoriaTitleRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
        },
        '-=1.2'
      )
      // SCENE 05: Event Info (Waktu & Tempat) reveal
      .to(
        eventInfoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.7'
      )
      // SCENE 06: Marquee Countdown Boxes staggered entrance
      .to(
        countdownSectionRef.current,
        {
          opacity: 1,
          duration: 0.3,
        },
        '-=0.5'
      )
      .to(
        '.marquee-countdown-box',
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
        },
        '-=0.4'
      );
  }, []);

  // Jalankan animasi GSAP pada mount
  useGSAP(
    () => {
      playIntroAnimation(false);
    },
    { scope: containerRef }
  );

  // Skip Intro Handler
  const handleSkipIntro = () => {
    if (timelineRef.current) {
      timelineRef.current.progress(1);
    }
  };

  // Replay Intro Handler
  const handleReplayIntro = () => {
    playIntroAnimation(true);
  };

  return (
    <section
      ref={containerRef}
      aria-label="Section 1: Panggung Teater Memoria"
      className="relative w-full bg-transparent py-3 sm:py-8 md:py-12 px-2 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* ========================================================= */}
      {/* LAYER 1: GRAND THEATRICAL PROSCENIUM STAGE CONTAINER */}
      {/* Panggung teater berdiri proporsional (tidak gepeng) di tengah kanvas */}
      {/* ========================================================= */}
      <div className="relative w-full max-w-6xl xl:max-w-7xl mx-auto rounded-[24px] sm:rounded-[50px] shadow-[0_25px_70px_rgba(20,8,9,0.25),0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden bg-[#140809] border border-[#d6b46a]/40 min-h-[560px] xs:min-h-[600px] sm:min-h-[680px] md:min-h-[760px] lg:min-h-[820px] flex items-center justify-center">

        {/* 1. Backdrop Ambient Texture & Dark Velvet Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#350a10] via-[#1a0508] to-[#0c0204] z-0" />

        {/* 2. Velvet Curtains (Backdrop + Left & Right Animatable Folds) */}
        <TheatreCurtains leftCurtainRef={leftCurtainRef} rightCurtainRef={rightCurtainRef} />

        {/* 3. Golden Theatre Proscenium Arch & Marquee Bulbs Perimeter */}
        <TheatreArchFrame />

        {/* 4. Overhead Stage Spotlight Beam */}
        <div
          ref={spotlightRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl h-full opacity-0 pointer-events-none z-15"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, transparent 40%, rgba(214,180,106,0.2) 48%, rgba(245,233,211,0.35) 50%, rgba(214,180,106,0.2) 52%, transparent 60%)',
          }}
        />

        {/* ========================================================= */}
        {/* LAYER 6, 7, 8: CENTERSTAGE HERO CONTENT */}
        {/* Safe inner horizontal padding agar teks tidak pernah tertabrak pilar */}
        {/* ========================================================= */}
        <div className="relative z-10 w-full min-w-0 max-w-3xl lg:max-w-4xl mx-auto px-6 xs:px-8 sm:px-14 md:px-16 text-center flex flex-col items-center gap-2.5 xs:gap-3 sm:gap-4 md:gap-4.5 pt-10 xs:pt-12 sm:pt-16 md:pt-20 pb-16 xs:pb-18 sm:pb-24 md:pb-28">

          {/* MAIN SIGN: MEMORIA (Font Ballet, Rapi & Anggun dengan Keterbacaan Penuh di Semua Layar) */}
          <div ref={memoriaTitleRef} className="flex flex-col items-center select-none pt-1 sm:pt-2 px-1 overflow-visible opacity-0">
            <h1
              style={{
                fontFamily: 'var(--font-ballet), cursive',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7.2rem] xl:text-[8rem] font-normal tracking-[0.03em] bg-gradient-to-b from-[#fffbf0] via-[#f5d890] to-[#cba358] drop-shadow-[0_4px_24px_rgba(214,180,106,0.65)] hover:scale-102 transition-transform duration-300 leading-[1.1] pb-0.5 sm:pb-1 px-2 overflow-visible"
            >
              Memoria
            </h1>

            {/* Signature Metallic Underline with Art Deco Diamond Accent */}
            <div className="w-20 xs:w-28 sm:w-52 md:w-72 my-1 sm:my-1.5 relative flex items-center justify-center">
              <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#f5d890] to-transparent opacity-85" />
              <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-45 bg-[#fef08a] border border-[#a16207] shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
            </div>

            {/* TAGLINE ACARA DARI DATABASE */}
            {event.tagline && (
              <div
                style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
                className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg italic text-[#f5d890] tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mt-0.5 font-medium"
              >
                {event.tagline}
              </div>
            )}

            {/* DESKRIPSI ACARA DARI DATABASE (Aman dari pilar & tirai) */}
            {event.description && (
              <p className="max-w-[280px] xs:max-w-[320px] sm:max-w-lg md:max-w-xl text-[10.5px] xs:text-[11.5px] sm:text-xs md:text-sm text-[#f5e9d3]/85 font-light leading-relaxed mt-0.5 sm:mt-1 px-1 sm:px-4">
                {event.description}
              </p>
            )}
          </div>

          {/* EVENT INFORMATION: WAKTU & TEMPAT */}
          <div
            ref={eventInfoRef}
            className="w-full max-w-[290px] xs:max-w-[330px] sm:max-w-xl md:max-w-2xl px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#2c090d]/85 via-[#3a0d13]/90 to-[#2c090d]/85 border border-[#d6b46a]/40 shadow-xl backdrop-blur-md opacity-0"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between">
              
              {/* SISI WAKTU */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 sm:justify-center flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1c0406] border border-[#d6b46a]/50 flex items-center justify-center shrink-0 shadow-inner">
                  <Clock size={14} weight="fill" className="text-[#f5d890]" />
                </div>
                <div className="text-left min-w-0">
                  <span
                    style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
                    className="block text-[8px] sm:text-[9.5px] tracking-[0.2em] uppercase text-[#d6b46a] font-semibold"
                  >
                    WAKTU ACARA
                  </span>
                  <span className="block text-[11px] xs:text-xs sm:text-sm font-medium text-[#f5e9d3] leading-snug">
                    {formatWibDateOnly(event.eventStartAt)}
                  </span>
                  <span className="block text-[9.5px] xs:text-[10px] sm:text-[11px] font-mono text-[#f5d890]/85 leading-snug">
                    Pukul {formatWibTimeOnly(event.eventStartAt)}
                  </span>
                </div>
              </div>

              {/* PEMBATAS EMAS: ELEGAN & SIMETRIS (HORIZONTAL DI MOBILE, VERTIKAL DI DESKTOP) */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#d6b46a]/40 to-transparent my-2.5 sm:hidden" />
              <div className="hidden sm:block w-[1px] self-stretch bg-gradient-to-b from-transparent via-[#d6b46a]/40 to-transparent mx-4 my-1" />

              {/* SISI TEMPAT */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 sm:justify-center flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1c0406] border border-[#d6b46a]/50 flex items-center justify-center shrink-0 shadow-inner">
                  <MapPin size={14} weight="fill" className="text-[#f5d890]" />
                </div>
                <div className="text-left min-w-0">
                  <span
                    style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
                    className="block text-[8px] sm:text-[9.5px] tracking-[0.2em] uppercase text-[#d6b46a] font-semibold"
                  >
                    TEMPAT
                  </span>
                  <span className="block text-[11px] xs:text-xs sm:text-sm font-medium text-[#f5e9d3] leading-snug truncate">
                    {event.venueName}
                  </span>
                  <span className="block text-[9.5px] xs:text-[10px] sm:text-[11px] text-[#f5d890]/85 font-sans leading-snug">
                    Telkom University
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* MARQUEE COUNTDOWN TIMER (Presisi di atas panggung tanpa terpotong) */}
          <div ref={countdownSectionRef} className="flex flex-col items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 w-full max-w-2xl opacity-0">
            <div className="text-[8px] xs:text-[9px] sm:text-xs tracking-[0.24em] uppercase text-[#d6b46a]/90 font-semibold">
              {countdown.isPast ? 'Acara Telah Dimulai' : 'Menuju Malam Puncak'}
            </div>
            <TheatreCountdown countdown={countdown} />
          </div>

        </div>

        {/* 5. Stage Platform Podium (Lantai Panggung Bertingkat di Bagian Bawah) */}
        <StagePlatform />

        {/* ========================================================= */}
        {/* INTERACTIVE FLOATING CONTROLS: REPLAY INTRO & SKIP INTRO */}
        {/* ========================================================= */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-2">
          {/* Skip Intro Button (Tampil hanya saat animasi berjalan) */}
          {isIntroRunning && (
            <button
              onClick={handleSkipIntro}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#d6b46a]/40 text-[#f5d890] text-xs font-mono tracking-wider hover:bg-[#891523] transition-colors shadow-lg backdrop-blur-md"
              title="Lewati Animasi Tirai"
            >
              <FastForward size={14} weight="fill" />
              <span>SKIP</span>
            </button>
          )}

          {/* Replay Intro Button (Tampil saat tirai sudah terbuka) */}
          {curtainsOpened && (
            <button
              onClick={handleReplayIntro}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#200407]/80 border border-[#d6b46a]/50 text-[#f5d890] text-xs font-mono tracking-wider hover:bg-[#891523] hover:text-white transition-all shadow-lg backdrop-blur-md group"
              title="Putar Ulang Animasi Tirai Panggung"
            >
              <ArrowClockwise size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">REPLAY INTRO</span>
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
