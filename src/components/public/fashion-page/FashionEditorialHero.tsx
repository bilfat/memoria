'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RunwayStageIllustration } from './RunwayStageIllustration';

interface FashionEditorialHeroProps {
  title?: string;
  description?: string;
}

/**
 * FashionEditorialHero
 * Komposisi Editorial Asimetris 2 Kolom untuk Halaman /fashion-show:
 * - Bahasa Indonesia: "Panggung Peragaan Busana" / "Fashion Show MEMORIA"
 * - Kolom Kiri: Judul Editorial Bodoni Moda, Deskripsi Acara, Garis Velvet Burgundy & Gold
 * - Kolom Kanan: Ilustrasi Panggung 3D Runway Catwalk dengan sorotan lampu bergerak
 * - Badge "THE FASHION EXPERIENCE" telah dihapus sesuai permintaan
 */
export function FashionEditorialHero({ title, description }: FashionEditorialHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const footerLineRef = useRef<HTMLDivElement>(null);

  const isOldEnglishTitle = !title || title === 'The Runway Experience';
  const displayTitle = isOldEnglishTitle ? 'Panggung Fashion Show' : title;
  const displayDesc =
    description ||
    'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau karya civitas akademika SIKC.';

  useGSAP(
    () => {
      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set([headingRef.current, descRef.current, footerLineRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.set(headingRef.current, { opacity: 0, y: 35 });
      gsap.set(descRef.current, { opacity: 0, y: 20 });
      gsap.set(footerLineRef.current, { opacity: 0, scaleX: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(
        headingRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power4.out',
          delay: 0.1,
        }
      )
        .to(
          descRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          '-=0.5'
        )
        .to(
          footerLineRef.current,
          {
            opacity: 1,
            scaleX: 1,
            duration: 1.0,
            ease: 'power2.inOut',
          },
          '-=0.5'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto pt-6 sm:pt-10 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 select-none"
    >
      {/* Editorial Grid: Asymmetric 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* KOLOM KIRI: Editorial Typography & Information (7 Kolom Desktop) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Main Heading: Bodoni Moda */}
          <h1
            ref={headingRef}
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-[#3E2418] mb-5 sm:mb-6 leading-[1.14] drop-shadow-[0_2px_12px_rgba(62,36,24,0.06)] break-words"
          >
            {displayTitle}
          </h1>

          {/* Editorial Description: DM Sans */}
          <p
            ref={descRef}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="text-sm sm:text-base md:text-lg text-[#7B6050] font-normal leading-relaxed max-w-xl mb-6 sm:mb-8"
          >
            {displayDesc}
          </p>

          {/* Fine Burgundy & Gold Decorative Divider with Editorial Issue Meta */}
          <div
            ref={footerLineRef}
            className="w-full max-w-lg origin-left flex flex-wrap items-center justify-between gap-2 border-t border-[#891523]/25 pt-3 sm:pt-4 text-[10px] sm:text-xs font-mono tracking-wider text-[#7B6050]"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#891523]" />
              <span className="font-semibold text-[#891523]">FASHION SHOW MEMORIA</span>
            </div>
            <span className="text-[#A67B39] font-medium">DIESNATALIS 2026 • MALAM PERAGAAN BUSANA</span>
          </div>

        </div>

        {/* KOLOM KANAN: Layered Catwalk Stage Illustration (5 Kolom Desktop) */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <RunwayStageIllustration />
        </div>

      </div>
    </section>
  );
}
