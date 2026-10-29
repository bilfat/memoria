'use client';

import React from 'react';
import { CoatHanger } from '@phosphor-icons/react';
import { WinnerAnnouncement } from '@/types';

interface FashionWinnerCardProps {
  winner: WinnerAnnouncement;
}

/**
 * FashionWinnerCard
 * Kartu Galeri Penampil/Pemenang dengan Estetika Editorial Fashion (Grid 4 Kolom):
 * - Foto dominan dengan moving spotlight sweep & soft contact shadow
 * - Mendukung transparan PNG/WebP (contain + contact shadow) dan foto regular (cover portrait)
 * - Tipografi: Bodoni Moda (Nama) & DM Sans (Kategori Burgundy & Deskripsi)
 * - Bahasa Indonesia: Kategori, busana terpilih, dan penampil
 */
export function FashionWinnerCard({ winner }: FashionWinnerCardProps) {
  const isTransparent = Boolean(
    winner.winnerPhoto &&
      (winner.winnerPhoto.endsWith('.png') || winner.winnerPhoto.endsWith('.webp'))
  );

  return (
    <article className="group flex flex-col w-full text-left select-none fashion-winner-item transition-all duration-500">
      
      {/* 1. PHOTO PRESENTATION WITH RUNWAY EDITORIAL SPOTLIGHT */}
      <div className="relative w-full pt-3">
        
        {/* Soft Elliptical Floor Contact Shadow */}
        <div
          aria-hidden="true"
          className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 w-[82%] sm:w-[88%] h-7 sm:h-9 pointer-events-none transition-all duration-700 ease-out z-0 group-hover:w-[94%] group-hover:h-11 group-hover:opacity-100"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `
                radial-gradient(
                  ellipse at 50% 40%,
                  rgba(137, 21, 35, 0.22) 0%,
                  rgba(214, 180, 106, 0.22) 40%,
                  rgba(249, 244, 234, 0.08) 65%,
                  transparent 75%
                )
              `,
              filter: 'blur(8px)',
            }}
          />
        </div>

        {/* Photo Stage Frame */}
        <div className="fashion-photo-frame relative w-full aspect-[3/4] min-h-[300px] sm:min-h-[340px] rounded-2xl flex items-end justify-center transition-all duration-700 ease-out group-hover:-translate-y-2 z-10">
          
          {/* Overhead Moving Runway Spotlight Fixture & Sleek Conical Beam */}
          <div
            aria-hidden="true"
            className="fashion-spotlight-beam absolute inset-0 pointer-events-none overflow-visible rounded-2xl z-20 transition-all duration-700 ease-out opacity-85 group-hover:opacity-100"
          >
            {/* Top Linear Brass Mount */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
              <div className="w-8 sm:w-10 h-2 bg-gradient-to-r from-[#891523] via-[#D6B46A] to-[#891523] rounded-b-md shadow-sm" />
              <div className="w-2.5 h-1 bg-[#FFFDF0] rounded-full shadow-[0_0_8px_#F5D890] -mt-0.5" />
            </div>

            {/* Sleek Conical Runway Beam */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-[115%] h-[105%] pointer-events-none rounded-2xl"
              style={{
                clipPath: 'polygon(46% 0%, 54% 0%, 100% 100%, 0% 100%)',
                background: `
                  linear-gradient(
                    180deg,
                    rgba(255, 253, 240, 0.7) 0%,
                    rgba(245, 216, 144, 0.35) 25%,
                    rgba(137, 21, 35, 0.08) 60%,
                    transparent 100%
                  )
                `,
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Photo Render */}
          {winner.winnerPhoto ? (
            isTransparent ? (
              /* A. Transparent Model / Persona Cutout */
              <div className="relative w-full h-full flex items-end justify-center p-3 sm:p-4 z-10">
                <img
                  src={winner.winnerPhoto}
                  alt={`${winner.winnerName} - ${winner.categoryName}`}
                  className="w-full h-full max-h-[94%] object-contain object-bottom drop-shadow-[0_14px_24px_rgba(53,10,16,0.3)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            ) : (
              /* B. Regular Editorial Photography with Background */
              <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-[#891523]/25 shadow-[0_10px_24px_rgba(53,10,16,0.12)] z-10 transition-all duration-700 group-hover:shadow-[0_18px_36px_rgba(137,21,35,0.22)]">
                <img
                  src={winner.winnerPhoto}
                  alt={`${winner.winnerName} - ${winner.categoryName}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-[#FFFFFF]/40"
                />
              </div>
            )
          ) : (
            /* C. Fashion Silhouette Fallback */
            <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-[#FFFDF8] via-[#F9F4EA] to-[#F1E8D8] border border-[#891523]/20 shadow-[0_8px_20px_rgba(137,21,35,0.08)] relative overflow-hidden select-none z-10">
              <div className="w-16 h-16 rounded-full bg-[#FFFDF8] border border-[#891523]/30 shadow-md flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-105">
                <CoatHanger size={30} className="text-[#891523]" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#891523] uppercase font-semibold">
                FASHION SHOW MEMORIA
              </span>
              <p className="text-[11px] text-[#7B6050] mt-1 max-w-[180px]">
                Dokumentasi Busana Penampil
              </p>
            </div>
          )}

        </div>
      </div>

      {/* 2. EDITORIAL TYPOGRAPHY BELOW PHOTO */}
      <div className="mt-5 flex flex-col gap-1.5 px-0.5">
        {/* Kategori Fashion Show */}
        <div className="fashion-winner-cat flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#891523]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#891523] shrink-0" />
          <span
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="truncate"
          >
            {winner.categoryName}
          </span>
        </div>

        {/* Nama Pemenang / Penampil */}
        <h3
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="fashion-winner-name text-xl sm:text-[1.45rem] font-bold text-[#3E2418] tracking-tight leading-snug transition-colors duration-300 group-hover:text-[#891523] break-words"
        >
          {winner.winnerName}
        </h3>

        {/* Deskripsi Karya / Busana */}
        {winner.winnerDescription && (
          <p
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="fashion-winner-desc text-xs sm:text-[13px] text-[#7B6050] font-normal leading-relaxed line-clamp-3 mt-0.5"
          >
            {winner.winnerDescription}
          </p>
        )}
      </div>

    </article>
  );
}
