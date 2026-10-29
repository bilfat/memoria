'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { EventContent, WinnerAnnouncement } from '@/types';
import { Sparkle, CoatHanger, Trophy } from '@phosphor-icons/react';

export default function FashionShowPage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(
    mockStore.getPublishedWinners('FASHION_SHOW')
  );

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listPublishedWinners('FASHION_SHOW').then(setWinners);

    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setWinners(mockStore.getPublishedWinners('FASHION_SHOW'));
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell>
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Editorial Runway Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/50 text-memoria-champagne text-xs tracking-[0.25em] uppercase mb-4 shadow-lg">
            <CoatHanger size={15} className="text-memoria-gold" />
            <span>The Runway Experience</span>
          </div>

          <h1
            style={{ fontFamily: 'var(--font-bodoni), serif' }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-memoria-ivory tracking-wide mb-6"
          >
            {event.fashionTeaser.title || 'Fashion Show MEMORIA'}
          </h1>

          <p className="text-base sm:text-lg text-memoria-champagne/85 font-normal leading-relaxed">
            {event.fashionTeaser.description ||
              'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau.'}
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
              Pengumuman Pemenang Fashion Show
            </h2>
            <div className="flex-1 h-[1px] bg-memoria-gold/20" />
          </div>

          {winners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="rounded-3xl overflow-hidden bg-gradient-to-b from-memoria-dark-wine/80 to-[#120406] border border-memoria-gold/30 shadow-2xl hover:border-memoria-gold transition-all duration-300 flex flex-col group"
                >
                  {/* Photo area */}
                  <div className="h-72 w-full bg-memoria-midnight relative overflow-hidden flex items-center justify-center border-b border-memoria-gold/25">
                    {winner.winnerPhoto ? (
                      <img
                        src={winner.winnerPhoto}
                        alt={winner.winnerName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-memoria-champagne/60">
                        <Trophy size={48} weight="duotone" className="text-memoria-gold mb-2" />
                        <span className="text-xs uppercase tracking-widest text-memoria-gold">
                          Juara Kategori
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-memoria-midnight/90 border border-memoria-gold/60 text-memoria-gold text-xs font-semibold tracking-wider">
                      {winner.categoryName}
                    </div>
                  </div>

                  {/* Winner Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="text-xs text-memoria-gold/80 font-mono tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkle size={12} weight="fill" />
                        <span>Pemenang Terpilih</span>
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
            <div className="text-center py-20 px-6 rounded-3xl bg-memoria-dark-wine/40 border border-memoria-gold/20 max-w-2xl mx-auto shadow-inner">
              <Sparkle size={36} className="text-memoria-gold/60 mx-auto mb-3" />
              <h3
                style={{ fontFamily: 'var(--font-bodoni), serif' }}
                className="text-xl sm:text-2xl font-bold text-memoria-ivory mb-2"
              >
                Pemenang Akan Diumumkan Saat Acara
              </h3>
              <p className="text-xs sm:text-sm text-memoria-champagne/75 max-w-md mx-auto">
                Pengumuman pemenang kategori Fashion Show MEMORIA akan dipublikasikan secara resmi oleh panitia pada malam puncak perayaan.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayoutShell>
  );
}
