import React from 'react';
import { Band } from '@/types';
import { MusicNotes, Sparkle } from '@phosphor-icons/react';

interface BandShowcaseProps {
  bands: Band[];
}

export function BandShowcase({ bands }: BandShowcaseProps) {
  if (!bands || bands.length === 0) return null;

  return (
    <section id="lineup-band" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-memoria-dark-wine/70 border border-memoria-gold/40 text-memoria-champagne text-xs tracking-[0.25em] uppercase mb-3">
          <MusicNotes size={14} className="text-memoria-gold" />
          <span>The Performance</span>
        </div>
        <h2
          style={{ fontFamily: 'var(--font-bodoni), serif' }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-memoria-ivory tracking-wide"
        >
          Lineup & Bintang Panggung
        </h2>
        <p className="text-sm text-memoria-champagne/80 mt-3 font-normal">
          Harmoni alunan musik memukau yang menghidupkan malam penuh kenangan di atas panggung teater MEMORIA.
        </p>
      </div>

      {/* Alternating Asymmetric Band List */}
      <div className="flex flex-col gap-16">
        {bands.map((band, idx) => {
          const isEven = idx % 2 === 1;

          return (
            <div
              key={band.id}
              className={`flex flex-col ${
                isEven ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center gap-8 md:gap-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-memoria-dark-wine/60 to-[#120406]/80 border border-memoria-gold/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm`}
            >
              {/* Band Visual Stage Frame / Art Deco Poster */}
              <div className="w-full md:w-5/12 h-64 sm:h-80 rounded-2xl relative overflow-hidden border border-memoria-gold/40 bg-gradient-to-tr from-memoria-midnight via-memoria-burgundy/40 to-memoria-dark-wine flex items-center justify-center shadow-xl group">
                {/* Decorative Film Strip Borders */}
                <div className="absolute left-0 inset-y-0 w-3 border-r border-dashed border-memoria-gold/30 flex flex-col justify-between py-2 items-center">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1.5 h-2 bg-memoria-gold/20 rounded-xs" />
                  ))}
                </div>
                <div className="absolute right-0 inset-y-0 w-3 border-l border-dashed border-memoria-gold/30 flex flex-col justify-between py-2 items-center">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1.5 h-2 bg-memoria-gold/20 rounded-xs" />
                  ))}
                </div>

                {band.photo ? (
                  <img
                    src={band.photo}
                    alt={band.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-memoria-champagne/70">
                    <MusicNotes size={48} weight="duotone" className="text-memoria-gold mb-2" />
                    <span className="font-serif text-lg text-memoria-ivory font-bold">{band.name}</span>
                    <span className="text-xs text-memoria-gold/70 mt-1">Live Orchestra Band</span>
                  </div>
                )}
                {/* Subtle dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-memoria-midnight/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Band Info Editorial */}
              <div className="w-full md:w-7/12 flex flex-col items-start gap-4 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-memoria-gold">
                  <Sparkle size={14} weight="fill" />
                  <span>Band Lineup #{idx + 1}</span>
                </div>

                <h3
                  style={{ fontFamily: 'var(--font-bodoni), serif' }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-memoria-ivory"
                >
                  {band.name}
                </h3>

                <p className="text-sm sm:text-base text-memoria-champagne/80 leading-relaxed font-normal">
                  {band.description}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <span className="inline-block w-8 h-[1px] bg-memoria-gold" />
                  <span className="text-xs text-memoria-gold font-mono tracking-wider">
                    DIESNATALIS SIKC 2026 LIVE
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
