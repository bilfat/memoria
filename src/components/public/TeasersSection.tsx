import React from 'react';
import Link from 'next/link';
import { EventContent } from '@/types';
import { ArrowRight, Sparkle, Trophy, CoatHanger } from '@phosphor-icons/react';

interface TeasersSectionProps {
  event: EventContent;
}

export function TeasersSection({ event }: TeasersSectionProps) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-memoria-gold/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Fashion Show Teaser Card */}
        <div className="group relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-memoria-dark-wine/70 to-memoria-midnight/90 border border-memoria-gold/30 hover:border-memoria-gold shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <CoatHanger size={100} className="text-memoria-gold" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-memoria-burgundy/60 border border-memoria-gold/30 text-memoria-champagne text-xs tracking-wider uppercase mb-5">
              <Sparkle size={13} className="text-memoria-gold" />
              <span>Sorotan Panggung</span>
            </div>

            <h3
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory mb-3"
            >
              {event.fashionTeaser.title || 'The Runway Fashion Show'}
            </h3>

            <p className="text-sm text-memoria-champagne/80 leading-relaxed font-normal mb-8">
              {event.fashionTeaser.description}
            </p>
          </div>

          <Link
            href="/fashion-show"
            className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-memoria-dark-wine border border-memoria-gold/60 text-memoria-ivory font-semibold text-xs tracking-wider uppercase hover:bg-memoria-gold hover:text-memoria-midnight hover:border-transparent transition-all duration-300"
          >
            <span>Buka Fashion Show</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Awarding Teaser Card */}
        <div className="group relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-[#2d1b0d]/70 to-memoria-midnight/90 border border-memoria-gold/40 hover:border-memoria-gold shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={100} className="text-memoria-gold" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-memoria-gold/20 border border-memoria-gold/40 text-memoria-champagne text-xs tracking-wider uppercase mb-5">
              <Sparkle size={13} className="text-memoria-gold" />
              <span>Malam Penghargaan</span>
            </div>

            <h3
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory mb-3"
            >
              {event.awardingTeaser.title || 'The Golden Moment Awarding'}
            </h3>

            <p className="text-sm text-memoria-champagne/80 leading-relaxed font-normal mb-8">
              {event.awardingTeaser.description}
            </p>
          </div>

          <Link
            href="/awarding"
            className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-memoria-dark-wine border border-memoria-gold/60 text-memoria-ivory font-semibold text-xs tracking-wider uppercase hover:bg-memoria-gold hover:text-memoria-midnight hover:border-transparent transition-all duration-300"
          >
            <span>Buka Awarding</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
