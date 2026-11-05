'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { CheckSquareOffset, House } from '@phosphor-icons/react';

export default function PrivateVotingPage() {
  return (
    <div className="min-h-screen bg-memoria-black text-memoria-ivory flex flex-col font-sans selection:bg-memoria-burgundy selection:text-white">
      {/* Header */}
      <header className="border-b border-memoria-gold/15 bg-memoria-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogotype size="sm" showSubtitle={false} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-memoria-champagne hover:text-white transition-colors"
          >
            <House size={16} />
            <span>Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-memoria-burgundy/30 border border-memoria-gold/40 flex items-center justify-center text-memoria-gold mb-6 shadow-lg shadow-memoria-burgundy/20">
          <CheckSquareOffset size={36} weight="bold" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-memoria-ivory">
          Sesi Pemilihan Belum Dibuka
        </h1>
        <p className="text-sm text-memoria-champagne/70 mt-3 leading-relaxed max-w-md">
          Modul pemilihan private voting calon terfavorit dijadwalkan untuk dibuka pada Tahap 2 acara MEMORIA Diesnatalis SIKC 2026.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-memoria-burgundy hover:bg-memoria-burgundy/80 text-white text-xs font-semibold shadow-md transition-all border border-memoria-gold/30 hover:scale-102"
          >
            <House size={16} />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
