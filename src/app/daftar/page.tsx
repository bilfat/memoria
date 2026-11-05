'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicTicketsAction, TicketTypePublicDTO } from '@/app/actions/tickets';
import { createClient } from '@/lib/supabase/client';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider } from '@/components/ui/Toast';
import { formatWibDateTime } from '@/lib/date';
import { Ticket, ArrowLeft, Clock } from '@phosphor-icons/react';

export default function TicketChooserPage() {
  const [tickets, setTickets] = useState<TicketTypePublicDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTickets = () => {
      getPublicTicketsAction()
        .then((data) => {
          if (isMounted) setTickets(data);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchTickets();

    // Supabase Realtime: dengarkan perubahan tabel tickets dan participants secara live
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:public-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          fetchTickets();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
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
              Seluruh tiket diterbitkan secara <strong>GRATIS</strong> untuk mahasiswa Universitas Telkom.
              <br />
              <span className="text-memoria-gold font-medium">
                * 1 NIM hanya boleh memiliki 1 tiket untuk seluruh perayaan MEMORIA.
              </span>
            </p>
          </div>

          {/* Tickets List: Vintage Carnival Ticket Cards (Mobile: 1 Baris Horizontal Swipe | Laptop: 3 Kolom) */}
          {loading ? (
            <div className="text-center py-20 px-6 rounded-3xl bg-memoria-dark-wine/20 border border-memoria-gold/20 max-w-lg mx-auto">
              <div className="inline-block w-8 h-8 border-2 border-memoria-gold border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-memoria-champagne/80">Memuat kategori tiket resmi...</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-2 -mx-2 sm:mx-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible justify-start sm:justify-center">
              {tickets.map((ticket) => {
                let badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
                if (ticket.derivedStatus === 'upcoming') {
                  badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
                } else if (ticket.derivedStatus === 'sold_out') {
                  badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
                } else if (ticket.derivedStatus === 'closed') {
                  badgeColor = 'bg-gray-800 text-gray-300 border-gray-600';
                }

                return (
                  <div
                    key={ticket.id}
                    className="relative w-[84vw] xs:w-[320px] sm:w-auto shrink-0 snap-center rounded-3xl bg-gradient-to-b from-[#32080e] via-[#1a0407] to-[#0f0204] border-2 border-[#d6b46a]/60 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_0_1px_rgba(214,180,106,0.25)] overflow-hidden flex flex-col justify-between hover:border-[#f5d890] hover:shadow-[0_16px_40px_rgba(214,180,106,0.25)] transition-all duration-300 group"
                  >
                    {/* Carnival Ticket Top Vintage Stamp Banner */}
                    <div className="bg-gradient-to-r from-[#180306] via-[#2d070d] to-[#180306] py-2 px-5 border-b border-[#d6b46a]/40 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#d6b46a]">
                      <span className="flex items-center gap-1 font-bold">
                        ★ ADMIT ONE ★
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${badgeColor}`}
                      >
                        {ticket.derivedStatusLabel}
                      </span>
                    </div>

                    {/* Carnival Ticket Main Body */}
                    <div className="p-5 sm:p-6 space-y-3.5 relative flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-[#f5d890]/80 font-mono uppercase tracking-wider mb-1">
                          <span>MEMORIA 2026</span>
                          <span>•</span>
                          <span>OFFICIAL PASS</span>
                        </div>

                        <h2
                          style={{ fontFamily: 'var(--font-bodoni), serif' }}
                          className="text-2xl sm:text-[1.65rem] font-bold text-memoria-ivory leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        >
                          {ticket.name}
                        </h2>

                        {ticket.description && (
                          <p className="text-xs text-memoria-champagne/80 leading-relaxed font-normal mt-2 line-clamp-3">
                            {ticket.description}
                          </p>
                        )}
                      </div>

                      {/* Carnival Perforated Tear-off Line with Notch Cutouts */}
                      <div className="relative py-2 my-2">
                        {/* Left Circular Punch Notch */}
                        <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-6 h-6 rounded-full bg-memoria-midnight border-2 border-[#d6b46a]/60 z-10 shadow-inner" />
                        {/* Right Circular Punch Notch */}
                        <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-6 h-6 rounded-full bg-memoria-midnight border-2 border-[#d6b46a]/60 z-10 shadow-inner" />
                        {/* Dashed Perforated Tear Line */}
                        <div className="border-t-2 border-dashed border-[#d6b46a]/40 w-full" />
                      </div>

                      {/* Ticket Pricing & Schedule (Tanpa Kuota) */}
                      <div className="space-y-2 text-xs font-mono text-memoria-champagne/75">
                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#25060b] border border-[#d6b46a]/25">
                          <span className="text-[11px] text-neutral-400">HARGA:</span>
                          <span className="text-xs font-bold text-[#f5d890] tracking-wide">
                            GRATIS / Rp0
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5 px-1 text-[11px]">
                          <span className="text-neutral-400">BATAS PENDAFTARAN:</span>
                          <span className="text-memoria-ivory font-medium">
                            {formatWibDateTime(ticket.registrationCloseAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Carnival Ticket Bottom Stub with Action Button */}
                    <div className="p-4 sm:p-5 bg-gradient-to-t from-[#0a0103] to-[#170306] border-t border-[#d6b46a]/30 flex flex-col items-center gap-2">
                      {ticket.isAvailable ? (
                        <Link
                          href={`/daftar/${ticket.id}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] hover:from-[#9e1c2c] hover:to-[#720e1a] border border-[#f5d890]/80 text-[#fffbf0] font-bold text-xs uppercase tracking-widest shadow-[0_4px_14px_rgba(181,39,53,0.4)] hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <Ticket size={16} weight="fill" className="text-[#f5d890]" />
                          <span>Pilih Tiket Ini</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 text-neutral-400 font-medium text-xs tracking-wider cursor-not-allowed border border-neutral-700/60"
                        >
                          {ticket.derivedStatusLabel}
                        </button>
                      )}
                      <span className="text-[9px] font-mono tracking-widest text-[#d6b46a]/50">
                        № MEM-2026 • ADMISSION PASS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-6 rounded-3xl bg-memoria-dark-wine/30 border border-memoria-gold/20 max-w-lg mx-auto">
              <Clock size={40} className="text-memoria-gold/60 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-memoria-ivory mb-1">Pendaftaran Belum Tersedia</h2>
              <p className="text-xs text-memoria-champagne/75 leading-relaxed">
                Panitia MEMORIA sedang menyiapkan jenis tiket. Silakan periksa kembali beberapa saat lagi.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
