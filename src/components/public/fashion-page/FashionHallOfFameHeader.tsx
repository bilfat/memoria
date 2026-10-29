'use client';

import React from 'react';

interface FashionHallOfFameHeaderProps {
  title?: string;
  description?: string;
}

/**
 * FashionHallOfFameHeader
 * Header Transisi untuk Galeri Pemenang Fashion Show:
 * - Badge "MEMORIA RUNWAY ARCHIVE" telah dihapus sesuai permintaan
 * - Heading bahasa Indonesia: "Penampil & Pemenang Fashion Show"
 * - Subtitle bahasa Indonesia: "Merayakan kreativitas, keanggunan, dan pesona karya busana civitas akademika MEMORIA."
 * - Garis pembatas beludru burgundy dengan aksen diamond emas
 */
export function FashionHallOfFameHeader({ title, description }: FashionHallOfFameHeaderProps) {
  const displayTitle = title || 'Penampil & Pemenang Fashion Show';
  const displayDesc =
    description || 'Merayakan kreativitas, keanggunan, dan pesona karya busana civitas akademika MEMORIA.';

  return (
    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 select-none">
      {/* 1. Main Title: Bodoni Moda */}
      <h2
        style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#3E2418] tracking-tight mb-4"
      >
        {displayTitle}
      </h2>

      {/* 2. Velvet Burgundy Line Divider with Center Gold Diamond */}
      <div className="w-36 h-[1.5px] mx-auto my-4 relative flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#891523] to-transparent" />
        <div className="absolute w-2 h-2 rotate-45 bg-[#D6B46A] border border-[#A67B39] shadow-[0_0_6px_rgba(214,180,106,0.8)]" />
      </div>

      {/* 3. Subtitle: DM Sans */}
      <p
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        className="text-sm sm:text-base text-[#7B6050] font-normal leading-relaxed max-w-lg mx-auto px-4"
      >
        {displayDesc}
      </p>
    </div>
  );
}
