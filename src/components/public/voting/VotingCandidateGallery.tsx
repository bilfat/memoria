'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Voting, Candidate, Participant } from '@/types';
import { VotingCandidateItem } from './VotingCandidateItem';
import { Sparkle, UserCheck, ShieldCheck } from '@phosphor-icons/react';

interface VotingCandidateGalleryProps {
  voting: Voting;
  candidates: Candidate[];
  verifiedVoter: Participant;
  onVoteClick: (candidate: Candidate) => void;
  submitting?: boolean;
}

/**
 * VotingCandidateGallery
 * Galeri kandidat panggung private voting:
 * - Grid 3 kolom desktop, 2 kolom tablet, 1 kolom mobile
 * - Tanpa background card tebal di belakang foto
 * - Animasi GSAP entrance elegan (spotlight -> kandidat -> info & tombol)
 */
export function VotingCandidateGallery({
  voting,
  candidates,
  verifiedVoter,
  onVoteClick,
  submitting = false,
}: VotingCandidateGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || candidates.length === 0) return;

      const isReduced =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.location.search.includes('skipIntro=1'));

      if (isReduced) {
        gsap.set('.candidate-gallery-card', { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.killTweensOf('.candidate-gallery-card');

      // Animasi Bertahap: Lighting & Candidate Reveal
      gsap.fromTo(
        '.candidate-gallery-card',
        {
          opacity: 0,
          y: 35,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    },
    { dependencies: [candidates.length], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto space-y-12 select-none">
      {/* ========================================================= */}
      {/* 1. HEADER GALERI: INFORMASI SESI & IDENTITAS PEMILIH */}
      {/* ========================================================= */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
        {/* Badge Sesi Voting */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#350a10]/80 border border-[#d6b46a]/50 text-[#f5d890] text-xs font-mono tracking-[0.25em] uppercase shadow-lg">
          <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
          <span>GOLDEN SPOTLIGHT VOTING</span>
        </div>

        {/* Judul Kategori Voting (Bodoni Moda) */}
        <h1
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f5e9d3] tracking-tight leading-[1.14]"
        >
          {voting.title}
        </h1>

        {/* Minimalist Gold Divider */}
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#d6b46a] to-transparent my-1" />

        {/* Deskripsi Kategori */}
        {voting.description && (
          <p
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="text-sm sm:text-base text-[#eacfa4]/85 max-w-2xl leading-relaxed"
          >
            {voting.description}
          </p>
        )}

        {/* Info Banner: Pemilih Sah & Aturan 1 Suara */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#350a10]/90 border border-[#d6b46a]/40 text-xs text-[#f5e9d3]">
            <UserCheck size={16} className="text-[#d6b46a]" />
            <span>
              Pemilih Sah: <strong className="text-white">{verifiedVoter.fullName}</strong> ({verifiedVoter.nim})
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b0609]/80 border border-[#d6b46a]/20 text-[11px] font-mono text-[#eacfa4]/70">
            <ShieldCheck size={14} className="text-[#d6b46a]" />
            <span>1 Peserta = 1 Suara Sah</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. GRID 3 KOLOM DESKTOP, 2 KOLOM TABLET, 1 KOLOM MOBILE */}
      {/* ========================================================= */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 sm:gap-x-10 sm:gap-y-16 lg:gap-x-12 lg:gap-y-20 pt-4">
          {candidates.map((candidate) => (
            <VotingCandidateItem
              key={candidate.id}
              candidate={candidate}
              onVoteClick={onVoteClick}
              disabled={submitting}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center max-w-md mx-auto rounded-3xl bg-[#350a10]/40 border border-[#d6b46a]/30 p-8 space-y-3">
          <Sparkle size={36} className="text-[#d6b46a] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#f5e9d3]">Belum Ada Kandidat</h3>
          <p className="text-xs text-[#eacfa4]/70">
            Daftar nominasi kandidat belum dipublikasikan oleh panitia untuk kategori ini.
          </p>
        </div>
      )}
    </div>
  );
}

