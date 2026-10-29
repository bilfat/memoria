import React from 'react';
import Link from 'next/link';
import { BrandLogotype } from '../brand/BrandLogotype';
import { Sparkle } from '@phosphor-icons/react';

export function PublicFooter() {
  return (
    <footer className="relative border-t border-[#d6b46a]/35 pt-16 pb-12 overflow-hidden text-neutral-800 z-10 select-none">
      {/* Decorative top ambient crimson & gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-[radial-gradient(ellipse_at_top,_rgba(181,39,53,0.12)_0%,_rgba(214,180,106,0.12)_40%,_transparent_75%)] blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          <BrandLogotype size="lg" showSubtitle={true} variant="dark" />

          <p className="max-w-xl text-sm text-neutral-600 font-normal leading-relaxed">
            Perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.
            Malam penuh memori, keanggunan beludru merah, dan selebrasi prestasi civitas akademika.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-700 py-2.5 border-y border-[#d6b46a]/30 w-full max-w-lg font-medium">
            <Link href="/" className="hover:text-[#891523] transition-colors">
              Beranda
            </Link>
            <span className="text-[#d6b46a]">•</span>
            <Link href="/fashion-show" className="hover:text-[#891523] transition-colors">
              Fashion Show
            </Link>
            <span className="text-[#d6b46a]">•</span>
            <Link href="/awarding" className="hover:text-[#891523] transition-colors">
              Awarding
            </Link>
            <span className="text-[#d6b46a]">•</span>
            <Link href="/daftar" className="hover:text-[#891523] transition-colors">
              Tiket
            </Link>
            <span className="text-[#d6b46a]">•</span>
            <Link
              href="/panitia/login"
              className="text-[#891523] hover:text-[#b52735] font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkle size={12} weight="fill" className="text-[#d6b46a]" />
              Portal Panitia
            </Link>
          </div>

          <div className="text-[11px] text-neutral-500 tracking-wider">
            &copy; 2026 MEMORIA SIKC • Telkom University. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
