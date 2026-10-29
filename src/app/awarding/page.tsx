'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { EventContent, WinnerAnnouncement } from '@/types';
import { Sparkle, Trophy } from '@phosphor-icons/react';

export default function AwardingPage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(
    mockStore.getPublishedWinners('AWARDING')
  );

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listPublishedWinners('AWARDING').then(setWinners);

    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setWinners(mockStore.getPublishedWinners('AWARDING'));
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell>
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Golden Moment Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-memoria-gold/20 border border-memoria-gold/50 text-memoria-champagne text-xs tracking-[0.25em] uppercase mb-4 shadow-lg">
            <Trophy size={16} className="text-memoria-gold" />
            <span>The Golden Moment</span>
          </div>

          <h1
            style={{ fontFamily: 'var(--font-bodoni), serif' }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-memoria-ivory tracking-wide mb-6"
          >
            {event.awardingTeaser.title || 'Malam Penghargaan MEMORIA'}
          </h1>

          <p className="text-base sm:text-lg text-memoria-champagne/85 font-normal leading-relaxed">
            {event.awardingTeaser.description ||
              'Apresiasi dan kehormatan tertinggi atas kontribusi, inovasi, dan prestasi gemilang mahasiswa serta civitas akademika SIKC.'}
          </p>
        </div>

        {/* Published Winners Showcase Section */}
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[2px] bg-memoria-gold" />
            <h2
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
            >
              Daftar Penghargaan Kehormatan
            </h2>
            <div className="flex-1 h-[1px] bg-memoria-gold/20" />
          </div>

          {winners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#2a170b] to-[#120502] border border-memoria-gold/40 shadow-2xl hover:border-memoria-gold transition-all duration-300 flex flex-col group"
                >
                  {/* Photo / Badge area */}
                  <div className="h-72 w-full bg-memoria-midnight relative overflow-hidden flex items-center justify-center border-b border-memoria-gold/30">
                    {winner.winnerPhoto ? (
                      <img
                        src={winner.winnerPhoto}
                        alt={winner.winnerName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-memoria-champagne/60">
                        <Trophy size={54} weight="fill" className="text-memoria-gold mb-3 animate-pulse" />
                        <span className="text-xs uppercase tracking-widest text-memoria-gold font-bold">
                          Penghargaan Kehormatan
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-memoria-midnight/90 border border-memoria-gold/70 text-memoria-gold text-xs font-semibold tracking-wider shadow-lg">
                      {winner.categoryName}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="text-xs text-memoria-gold/80 font-mono tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkle size={12} weight="fill" />
                        <span>Penerima Penghargaan</span>
                      </div>
                      <h3
                        style={{ fontFamily: 'var(--font-bodoni), serif' }}
                        className="text-2xl font-bold text-memoria-ivory"
                      >
                        {winner.winnerName}
                      </h3>
                      <p className="text-xs sm:text-sm text-memoria-champagne/80 mt-3 leading-relaxed">
                        {winner.winnerDescription}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 rounded-3xl bg-[#2a170b]/40 border border-memoria-gold/20 max-w-2xl mx-auto shadow-inner">
              <Trophy size={36} className="text-memoria-gold/60 mx-auto mb-3" />
              <h3
                style={{ fontFamily: 'var(--font-bodoni), serif' }}
                className="text-xl sm:text-2xl font-bold text-memoria-ivory mb-2"
              >
                Pemenang Akan Diumumkan Saat Acara
              </h3>
              <p className="text-xs sm:text-sm text-memoria-champagne/75 max-w-md mx-auto">
                Daftar peraih penghargaan MEMORIA akan diumumkan secara langsung oleh dewan kehormatan pada malam puncak penganugerahan.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayoutShell>
  );
}
