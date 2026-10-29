'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, House, Sparkle } from '@phosphor-icons/react';

interface AlreadyVotedStateProps {
  votingTitle: string;
  voterNim: string;
  voterName?: string;
}

/**
 * AlreadyVotedState
 * Tampilan saat peserta yang terverifikasi membuka kembali sesi voting yang sudah pernah diisi.
 * Menegaskan aturan 1 peserta = 1 suara secara elegan.
 */
export function AlreadyVotedState({
  votingTitle,
  voterNim,
  voterName,
}: AlreadyVotedStateProps) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-12 px-4 select-none">
      {/* Icon Badge */}
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#350a10] to-[#140809] border-2 border-[#d6b46a] shadow-[0_0_35px_rgba(214,180,106,0.35)] flex items-center justify-center text-[#f5d890]">
        <CheckCircle size={44} weight="fill" />
        <div className="absolute -top-1 -right-1">
          <Sparkle size={18} weight="fill" className="text-[#fef08a]" />
        </div>
      </div>

      {/* Heading & Subtitle */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono tracking-[0.22em] text-[#d6b46a] uppercase font-semibold">
          SUARA SUDAH TERCATAT
        </span>

        <h2
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="text-3xl sm:text-4xl font-bold text-[#f5e9d3] tracking-tight"
        >
          Kamu Sudah Memberikan Suara
        </h2>

        {/* Minimalist Divider */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d6b46a] to-transparent mx-auto" />

        <p
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          className="text-xs sm:text-sm text-[#eacfa4]/85 leading-relaxed max-w-md mx-auto"
        >
          {voterName ? <strong className="text-white">{voterName}</strong> : 'Peserta'}{' '}
          (NIM: <span className="font-mono text-[#f5d890]">{voterNim}</span>) telah resmi tercatat
          berpartisipasi pada kategori <strong className="text-[#f5d890]">{votingTitle}</strong>.
          Satu peserta sah hanya memiliki satu hak suara pada setiap kategori voting.
        </p>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#d6b46a] text-white text-xs uppercase font-bold tracking-wider shadow-[0_4px_25px_rgba(181,39,53,0.5)] hover:brightness-110 active:scale-95 transition-all"
        >
          <House size={16} />
          <span>KEMBALI KE BERANDA</span>
        </Link>
      </div>
    </div>
  );
}

