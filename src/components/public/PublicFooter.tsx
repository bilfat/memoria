import React from 'react';
import Link from 'next/link';
import { BrandLogotype } from '../brand/BrandLogotype';
import { Sparkle } from '@phosphor-icons/react';

export function PublicFooter() {
  return (
    <footer className="relative bg-memoria-midnight border-t border-memoria-gold/20 pt-16 pb-12 overflow-hidden text-memoria-ivory">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-memoria-burgundy/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          <BrandLogotype size="lg" showSubtitle={true} />

          <p className="max-w-xl text-sm text-memoria-champagne/80 font-normal leading-relaxed">
            Perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.
            Malam penuh memori, keanggunan beludru, dan selebrasi prestasi civitas akademika.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-memoria-champagne/70 py-2 border-y border-memoria-gold/15 w-full max-w-lg">
            <Link href="/" className="hover:text-memoria-gold transition-colors">
              Beranda
            </Link>
            <span className="text-memoria-gold/40">•</span>
            <Link href="/fashion-show" className="hover:text-memoria-gold transition-colors">
              Fashion Show
            </Link>
            <span className="text-memoria-gold/40">•</span>
            <Link href="/awarding" className="hover:text-memoria-gold transition-colors">
              Awarding
            </Link>
            <span className="text-memoria-gold/40">•</span>
            <Link href="/daftar" className="hover:text-memoria-gold transition-colors">
              Tiket Gratis
            </Link>
            <span className="text-memoria-gold/40">•</span>
            <Link href="/panitia/login" className="hover:text-memoria-gold transition-colors flex items-center gap-1">
              <Sparkle size={12} className="text-memoria-gold" />
              Portal Panitia
            </Link>
          </div>

          <div className="text-[11px] text-memoria-dusty-rose tracking-wider">
            &copy; 2026 MEMORIA SIKC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
