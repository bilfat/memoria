'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /**
   * Ambang batas rasio kemunculan elemen di viewport (0.0 - 1.0)
   */
  threshold?: number;
  /**
   * Jarak offset pemicu observasi
   */
  rootMargin?: string;
}

export function ScrollSection({
  children,
  id,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
}: ScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<'hidden-below' | 'visible' | 'hidden-above'>('hidden-below');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Hormati preferensi aksesibilitas jika pengguna mematikan animasi
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setScrollState('visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;

        if (entry.isIntersecting) {
          // Elemen berada di dalam area pandang (masuk)
          setScrollState('visible');
        } else {
          // Elemen keluar dari area pandang
          if (rect.top < 0) {
            // Keluar melintasi bagian atas viewport (saat scroll ke bawah)
            setScrollState('hidden-above');
          } else if (rect.top >= windowHeight) {
            // Berada di bawah viewport (saat scroll ke atas)
            setScrollState('hidden-below');
          }
        }
      },
      {
        threshold: [0, threshold, 0.4],
        rootMargin: rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  // State class mapping untuk transisi yang super mulus (GPU compositor accelerated)
  let stateClass = 'scroll-section-visible opacity-100 translate-y-0 scale-100';
  if (scrollState === 'hidden-below') {
    stateClass = 'scroll-section-hidden-below opacity-0 translate-y-12 scale-[0.985] pointer-events-none';
  } else if (scrollState === 'hidden-above') {
    stateClass = 'scroll-section-hidden-above opacity-0 -translate-y-8 scale-[0.985] pointer-events-none';
  }

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`relative w-full transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] ${stateClass} ${className}`}
    >
      {/* Dynamic Stagger Transition Styles for Inner Content Columns */}
      <style jsx global>{`
        .scroll-section-hidden-below [data-scroll-stagger='left'] {
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-section-hidden-below [data-scroll-stagger='right'] {
          opacity: 0;
          transform: translateX(24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-section-hidden-above [data-scroll-stagger='left'],
        .scroll-section-hidden-above [data-scroll-stagger='right'] {
          opacity: 0;
          transform: translateY(-16px);
          transition: opacity 0.5s ease-in, transform 0.5s ease-in;
        }
        .scroll-section-visible [data-scroll-stagger='left'] {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
        }
        .scroll-section-visible [data-scroll-stagger='right'] {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
        }
      `}</style>
      {children}
    </div>
  );
}
