'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ticketAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { TicketType, TicketAvailabilityStatus } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider } from '@/components/ui/Toast';
import { formatWibDateTime } from '@/lib/date';
import { Ticket, ArrowLeft, CheckCircle, Warning, Clock } from '@phosphor-icons/react';

export default function TicketChooserPage() {
  const [tickets, setTickets] = useState<TicketType[]>(mockStore.getPublishedTickets());

  useEffect(() => {
    ticketAdapter.listPublishedTickets().then(setTickets);
    const unsubscribe = mockStore.subscribe(() => {
      setTickets(mockStore.getPublishedTickets());
    });
    return () => unsubscribe();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Top navigation & Brand */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-memoria-gold/20 pb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-memoria-champagne/80 hover:text-memoria-gold transition-colors py-1.5 px-3.5 rounded-full border border-memoria-gold/30 hover:border-memoria-gold"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Beranda</span>
            </Link>

            <BrandLogotype size="sm" showSubtitle={false} />
          </div>

          {/* Heading */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-memoria-dark-wine/70 border border-memoria-gold/30 text-memoria-champagne text-xs uppercase tracking-widest">
              <Ticket size={14} className="text-memoria-gold" />
              <span>Tiket Masuk Digital</span>
            </div>
            <h1
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-3xl sm:text-4xl font-bold text-memoria-ivory"
            >
              Pilih Tiket MEMORIA
            </h1>
            <p className="text-xs sm:text-sm text-memoria-champagne/80 leading-relaxed font-normal">
              Seluruh tiket diterbitkan secara <strong>GRATIS</strong> untuk mahasiswa D4 Sistem Informasi Kota Cerdas.
              <br />
              <span className="text-memoria-gold font-medium">
                * 1 NIM hanya boleh memiliki 1 tiket untuk seluruh event MEMORIA.
              </span>
            </p>
          </div>

          {/* Tickets List: Vintage Cinema Ticket Cards */}
          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket) => {
                const remaining = ticketAdapter.getRemainingQuota(ticket.id);
                const availability = ticketAdapter.getTicketAvailability(ticket);

                let badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
                let badgeText = 'Tersedia';
                let isSelectable = true;

                if (availability === 'BELUM_DIBUKA') {
                  badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
                  badgeText = 'Belum Dibuka';
                  isSelectable = false;
                } else if (availability === 'PENUH') {
                  badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
                  badgeText = 'Kuota Penuh';
                  isSelectable = false;
                } else if (availability === 'DITUTUP') {
                  badgeColor = 'bg-gray-800 text-gray-300 border-gray-600';
                  badgeText = 'Pendaftaran Ditutup';
                  isSelectable = false;
                }

                return (
                  <div
                    key={ticket.id}
                    className="relative rounded-2xl bg-gradient-to-br from-memoria-dark-wine to-[#1a0508] border border-memoria-gold/40 shadow-xl overflow-hidden flex flex-col justify-between hover:border-memoria-gold transition-all duration-300"
                  >
                    {/* Perforated ticket cutouts */}
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-memoria-midnight border border-memoria-gold/40 z-10" />
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-memoria-midnight border border-memoria-gold/40 z-10" />

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono tracking-widest text-memoria-gold/90 uppercase font-semibold">
                          ADMISSION TICKET
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                      </div>

                      <h2
                        style={{ fontFamily: 'var(--font-bodoni), serif' }}
                        className="text-2xl font-bold text-memoria-ivory leading-snug"
                      >
                        {ticket.name}
                      </h2>

                      {ticket.description && (
                        <p className="text-xs sm:text-sm text-memoria-champagne/80 leading-relaxed font-normal">
                          {ticket.description}
                        </p>
                      )}

                      {/* Quota & Schedule details */}
                      <div className="pt-3 border-t border-memoria-gold/20 flex flex-col gap-2 text-xs text-memoria-champagne/70 font-mono">
                        <div className="flex justify-between">
                          <span>HARGA:</span>
                          <span className="text-memoria-gold font-bold">GRATIS / Rp0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SISA KUOTA:</span>
                          <span className="font-bold text-memoria-ivory">
                            {remaining === null ? 'Tanpa Batas' : `${remaining} Kursi Tersedia`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>BATAS DAFTAR:</span>
                          <span>{formatWibDateTime(ticket.registrationClosesAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 bg-[#120305]/70 border-t border-memoria-gold/20 flex items-center justify-end">
                      {isSelectable ? (
                        <Link
                          href={`/daftar/${ticket.id}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-memoria-burgundy hover:bg-memoria-stage-red border border-memoria-gold/70 text-memoria-ivory font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          <Ticket size={16} weight="fill" />
                          <span>Pilih Tiket Ini</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gray-800 text-gray-400 font-medium text-xs tracking-wider cursor-not-allowed border border-gray-700"
                        >
                          {badgeText}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-6 rounded-3xl bg-memoria-dark-wine/30 border border-memoria-gold/20 max-w-lg mx-auto">
              <Clock size={40} className="text-memoria-gold/60 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-memoria-ivory mb-1">Pendaftaran Belum Tersedia</h2>
              <p className="text-xs text-memoria-champagne/75">
                Panitia MEMORIA sedang menyiapkan jenis tiket. Silakan periksa kembali beberapa saat lagi.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
