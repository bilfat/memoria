'use client';

import React, { useState } from 'react';
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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-memoria-midnight/80 border-b border-memoria-gold/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <BrandLogotype size="md" showSubtitle={false} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm tracking-wider font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-memoria-gold font-semibold'
                    : 'text-memoria-ivory/80 hover:text-memoria-ivory'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-memoria-gold to-memoria-stage-red rounded-full" />
                )}
              </Link>
            );
          })}
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
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-base font-medium transition-colors ${
                  isActive
                    ? 'text-memoria-gold font-bold border-l-2 border-memoria-gold pl-3'
                    : 'text-memoria-ivory/80 hover:text-memoria-ivory'
                }`}
              >
                {link.label}
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
