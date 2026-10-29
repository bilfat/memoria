import React from 'react';
import Link from 'next/link';
import { EventContent } from '@/types';
import { ArrowRight, Sparkle, CoatHanger } from '@phosphor-icons/react';

interface TeasersSectionProps {
  event: EventContent;
}

export function TeasersSection({ event }: TeasersSectionProps) {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#d6b46a]/25">
      {/* Fashion Show Editorial Teaser Card */}
      <div className="group relative rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 bg-gradient-to-r from-[#200508] via-[#350a10] to-[#1a0407] border border-[#d6b46a]/40 hover:border-[#f5d890] shadow-[0_20px_50px_rgba(32,5,8,0.25)] hover:shadow-[0_25px_60px_rgba(32,5,8,0.35)] transition-all duration-500 overflow-hidden">
        {/* Ambient Theatrical Coat Hanger Watermark */}
        <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 pointer-events-none">
          <CoatHanger size={240} className="text-[#f5d890]" />
        </div>

        {/* Soft Gold Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,_rgba(214,180,106,0.12)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#891523]/80 border border-[#d6b46a]/40 text-[#f5e9d3] text-xs font-mono tracking-[0.2em] uppercase mb-5 shadow-inner">
            <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
            <span>SOROTAN PANGGUNG RUNWAY</span>
          </div>

          <h3
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#ffffff] via-[#f5d890] to-[#cba358] bg-clip-text text-transparent">
              {event.fashionTeaser.title || 'The Runway Fashion Show'}
            </span>
          </h3>

          <p
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            className="text-sm sm:text-base text-[#eacfa4]/90 leading-relaxed font-normal mb-8 max-w-xl"
          >
            {event.fashionTeaser.description}
          </p>

          <Link
            href="/fashion-show"
            className="group/btn inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#f5d890]/80 text-[#fffdfa] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase hover:border-[#fef08a] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_8px_25px_rgba(181,39,53,0.5)]"
          >
            <span>BUKA FASHION SHOW</span>
            <ArrowRight size={16} weight="bold" className="text-[#fef08a] group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
