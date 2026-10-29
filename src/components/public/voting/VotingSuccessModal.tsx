'use client';

import React from 'react';
import Link from 'next/link';
import { House, Sparkle } from '@phosphor-icons/react';
import { GoldenSealAnimation } from './GoldenSealAnimation';

interface VotingSuccessModalProps {
  candidateName: string;
  voterName?: string;
}

/**
 * VotingSuccessModal
 * Modal keberhasilan voting teatrikal:
 * - Menampilkan animasi Golden Seal (Your Vote Has Been Sealed)
 * - Menyebutkan nama kandidat yang dipilih
 * - Tombol Kembali ke Beranda
 */
export function VotingSuccessModal({
  candidateName,
  voterName,
}: VotingSuccessModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 select-none"
    >
      <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#350a10] via-[#1c0609] to-[#140809] border-2 border-[#d6b46a] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(214,180,106,0.35)] text-center space-y-5 animate-in zoom-in-95 duration-350">
        
        {/* Golden Seal Animation */}
        <GoldenSealAnimation />

        {/* Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#140809]/80 border border-[#d6b46a]/40 text-[#f5d890] text-xs font-mono tracking-widest uppercase">
            <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
            <span>VOTE CONFIRMED & SEALED</span>
          </div>

          <h2
            id="success-modal-title"
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-3xl sm:text-4xl font-bold text-[#f5e9d3] tracking-tight"
          >
            Voting Berhasil!
          </h2>

          <p className="text-xs sm:text-sm text-[#eacfa4]/85 leading-relaxed pt-1">
            Terima kasih{voterName ? `, ${voterName}` : ''} telah berpartisipasi dalam MEMORIA.
            <br />
            Suaramu untuk{' '}
            <strong className="text-[#f5d890] font-bold text-sm sm:text-base block mt-1">
              {candidateName}
            </strong>{' '}
            telah resmi dicatat dan disegel dalam sistem.
          </p>
        </div>

        {/* Action Button: Kembali ke Beranda */}
        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#d6b46a] text-white font-bold text-xs uppercase tracking-widest shadow-[0_4px_25px_rgba(181,39,53,0.6)] hover:brightness-110 active:scale-95 transition-all"
          >
            <House size={16} />
            <span>KEMBALI KE BERANDA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

