'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogotype } from '../brand/BrandLogotype';
import { List, X, LockKey } from '@phosphor-icons/react';

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Fashion Show', href: '/fashion-show' },
  { label: 'Awarding', href: '/awarding' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [hasMounted, setHasMounted] = useState(false);

  // Kalkulasi posisi dan lebar indikator sliding berdasarkan link aktif atau link yang di-hover
  const updateIndicatorPosition = useCallback(
    (targetHref?: string | null) => {
      const activeLink = NAV_LINKS.find((link) =>
        link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
      );

      const resolvedHref = targetHref || (activeLink ? activeLink.href : null);

      if (!resolvedHref) {
        setIndicator((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const targetEl = linkRefs.current[resolvedHref];
      const navEl = navRef.current;

      if (targetEl && navEl) {
        const navRect = navEl.getBoundingClientRect();
        const linkRect = targetEl.getBoundingClientRect();

        const left = linkRect.left - navRect.left;
        const width = linkRect.width;

        setIndicator({
          left,
          width,
          opacity: 1,
        });
      }
    },
    [pathname]
  );

  // Pantau perubahan pathname dan window resize
  useEffect(() => {
    updateIndicatorPosition(hoveredHref);

    // Jalankan di frame berikutnya agar layout / font sudah ter-render sempurna
    const raf = requestAnimationFrame(() => {
      updateIndicatorPosition(hoveredHref);
      setHasMounted(true);
    });

    const handleResize = () => {
      updateIndicatorPosition(hoveredHref);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateIndicatorPosition, hoveredHref]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-memoria-midnight/85 border-b border-memoria-gold/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <BrandLogotype size="md" showSubtitle={false} />
        </Link>

        {/* Desktop Navigation with Smooth Interactive Sliding Indicator */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHoveredHref(null)}
          className="relative hidden md:flex items-center gap-8 py-2"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[link.href] = el;
                }}
                onMouseEnter={() => setHoveredHref(link.href)}
                className={`relative py-1 text-sm tracking-wider font-medium transition-colors duration-250 select-none ${
                  isActive
                    ? 'text-memoria-gold font-semibold'
                    : 'text-memoria-ivory/80 hover:text-memoria-ivory'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Smooth Sliding Underline Indicator with Golden Glow */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#d6b46a] via-[#f5d890] to-[#b52735] shadow-[0_0_14px_rgba(245,216,144,0.9)] pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(${indicator.left}px, 0, 0)`,
              width: `${indicator.width}px`,
              opacity: indicator.opacity,
              transition: hasMounted
                ? 'transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease'
                : 'opacity 0.2s ease',
            }}
          >
            {/* Center diamond sparkle accent on the sliding line */}
            <span className="absolute -top-[1.5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#fffdf0] shadow-[0_0_8px_rgba(255,255,255,0.95)] rounded-[0.5px]" />
          </span>
        </nav>

        {/* Right side helper / panitia portal link */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/panitia/login"
            className="flex items-center gap-1.5 text-xs text-memoria-champagne/60 hover:text-memoria-champagne transition-colors py-1.5 px-3 rounded-full border border-memoria-gold/20 hover:border-memoria-gold/50"
            title="Portal Internal Panitia"
          >
            <LockKey size={14} />
            <span>Panitia</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-memoria-ivory hover:text-memoria-gold focus:outline-none"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X size={26} /> : <List size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-memoria-gold/20 bg-memoria-dark-wine/95 backdrop-blur-xl px-5 pt-3 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-base font-medium transition-all duration-300 flex items-center justify-between ${
                  isActive
                    ? 'text-memoria-gold font-bold border-l-2 border-memoria-gold pl-3 bg-memoria-burgundy/20 rounded-r-lg'
                    : 'text-memoria-ivory/80 hover:text-memoria-ivory pl-2'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-memoria-gold shadow-[0_0_8px_rgba(214,180,106,0.9)]" />
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-memoria-gold/15 flex justify-between items-center text-xs text-memoria-champagne/70">
            <span>Diesnatalis SIKC 2026</span>
            <Link
              href="/panitia/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1 text-memoria-gold hover:underline"
            >
              <LockKey size={14} />
              <span>Login Panitia</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
