'use client';

import React from 'react';
import { Candidate } from '@/types';
import { Sparkle, Check } from '@phosphor-icons/react';
import { CandidateSpotlight } from './CandidateSpotlight';
import { CandidateGoldGlow } from './CandidateGoldGlow';

interface VotingCandidateItemProps {
  candidate: Candidate;
  onVoteClick: (candidate: Candidate) => void;
  disabled?: boolean;
}

/**
 * VotingCandidateItem
 * Struktur item kandidat individual:
 * 1. Area spotlight dari atas
 * 2. Foto kandidat (tanpa background card tambahan, langsung di atas latar burgundy)
 * 3. Gold glow di bawah foto
 * 4. Nama kandidat (Bodoni Moda)
 * 5. Keterangan kandidat (DM Sans)
 * 6. Tombol VOTE emas berkelas
 */
export function VotingCandidateItem({
  candidate,
  onVoteClick,
  disabled = false,
}: VotingCandidateItemProps) {
  return (
    <article className="group relative flex flex-col w-full text-center select-none candidate-gallery-card">
      {/* ========================================================= */}
      {/* 1. FOTO KANDIDAT + SPOTLIGHT ATAS + GOLD GLOW BAWAH */}
      {/* ========================================================= */}
      <div className="relative w-full">
        {/* Pendaran Cahaya Emas di Bawah Foto */}
        <CandidateGoldGlow />

        {/* Framing Area Foto (Transparan, Menggunakan Latar Panggung Utama) */}
        <div className="candidate-photo-frame relative w-full aspect-[3/4] min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden flex items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-2 z-10">
          {/* Foto dari Admin atau Siluet Panggung Elegan */}
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-gradient-to-b from-[#350a10]/60 via-[#1e070a]/80 to-[#140809] border border-[#d6b46a]/30 relative overflow-hidden select-none">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#891523]/60 to-[#140809] border border-[#d6b46a]/50 shadow-[0_0_25px_rgba(214,180,106,0.3)] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                <Sparkle size={36} weight="fill" className="text-[#f5d890]" />
              </div>
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#d6b46a] uppercase">
                NOMINEE PANGGUNG
              </span>
              <p className="text-[11px] text-[#eacfa4]/70 mt-1">Dokumentasi Kandidat Resmi</p>
            </div>
          )}

          {/* Spotlight dari Atas */}
          <CandidateSpotlight />

          {/* Subtle Frame Golden Border Accent */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-[#d6b46a]/25 group-hover:ring-[#d6b46a]/50 transition-all duration-500 z-15"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. INFORMASI KANDIDAT & TOMBOL VOTE DI BAWAH FOTO */}
      {/* ========================================================= */}
      <div className="candidate-info mt-6 sm:mt-7 flex flex-col items-center flex-1 justify-between gap-4">
        <div className="space-y-2 max-w-sm px-2">
          {/* Nama Kandidat (Bodoni Moda) */}
          <h3
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-2xl sm:text-[1.65rem] font-bold text-[#f5e9d3] tracking-tight leading-snug group-hover:text-[#f5d890] transition-colors duration-300 break-words"
          >
            {candidate.name}
          </h3>

          {/* Keterangan Kandidat (DM Sans) */}
          {candidate.description && (
            <p
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              className="text-xs sm:text-sm text-[#eacfa4]/80 font-normal leading-relaxed line-clamp-3"
            >
              {candidate.description}
            </p>
          )}
        </div>

        {/* Tombol VOTE (Antique Gold dengan Teks Gelap) */}
        <div className="pt-2 w-full flex justify-center">
          <button
            type="button"
            onClick={() => onVoteClick(candidate)}
            disabled={disabled}
            className="candidate-vote-btn group/btn relative inline-flex items-center justify-center gap-2.5 px-9 py-3 rounded-full bg-gradient-to-r from-[#d6b46a] via-[#f5d890] to-[#d6b46a] text-[#140809] font-bold text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(214,180,106,0.35)] hover:shadow-[0_6px_25px_rgba(245,216,144,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkle size={15} weight="fill" className="text-[#891523] group-hover/btn:rotate-45 transition-transform duration-300" />
            <span>VOTE</span>
          </button>
        </div>
      </div>
    </article>
  );
}

