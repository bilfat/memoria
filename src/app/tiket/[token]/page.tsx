'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { getTicketViewDataAction } from '@/app/actions/tickets';
import type { TicketViewData } from '@/lib/ticketData';
import { createClient } from '@/lib/supabase/client';
import { generateQrDataUrl } from '@/lib/qrCode';
import { formatWibDateTime } from '@/lib/date';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import {
  Ticket,
  ArrowLeft,
  DownloadSimple,
  Printer,
  ShareNetwork,
  Warning,
  CheckCircle,
  MapPin,
  CalendarBlank,
  QrCode,
} from '@phosphor-icons/react';

function TicketViewContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { success, error: toastError } = useToast();

  const [ticket, setTicket] = useState<TicketViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTicket = () => {
      getTicketViewDataAction(token)
        .then((data) => {
          if (!isMounted) return;
          setTicket(data);
          if (data?.qrToken) {
            generateQrDataUrl(data.qrToken).then((qr) => {
              if (isMounted) setQrDataUrl(qr);
            });
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    setLoading(true);
    loadTicket();

    // Supabase Realtime: dengarkan perubahan check-in peserta secara live
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:ticket-view-${token}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          loadTicket();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadTicket();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [token]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      success('Tautan Disalin', 'Tautan e-ticket Anda siap dibagikan.');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-memoria-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-memoria-champagne/80 font-mono">
            Memuat e-ticket resmi MEMORIA...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto space-y-4 p-8 rounded-3xl bg-memoria-dark-wine/30 border border-memoria-gold/30">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto">
            <Warning size={24} weight="bold" />
          </div>
          <h1
            style={{ fontFamily: 'var(--font-bodoni), serif' }}
            className="text-2xl font-bold text-memoria-ivory"
          >
            Tiket Tidak Ditemukan
          </h1>
          <p className="text-xs text-memoria-champagne/80 leading-relaxed">
            Tautan akses e-ticket ini tidak valid atau telah kadaluarsa. Pastikan Anda membuka tautan resmi yang diberikan saat pendaftaran.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-memoria-burgundy hover:bg-memoria-stage-red border border-memoria-gold/60 text-memoria-ivory text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isArchived = ticket.ticketStatus === 'archived';

  return (
    <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-memoria-gold/20 pb-5 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-memoria-champagne/80 hover:text-memoria-gold transition-colors py-1.5 px-3.5 rounded-full border border-memoria-gold/30 hover:border-memoria-gold"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>

          <BrandLogotype size="sm" showSubtitle={false} />
        </div>

        {/* Warning Banner if ticket is Archived */}
        {isArchived && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-3 print:hidden">
            <Warning size={24} className="shrink-0 text-rose-400" />
            <div>
              <p className="font-bold text-sm text-rose-300">TIKET DIARSIPKAN / NONAKTIF</p>
              <p className="mt-0.5 leading-relaxed text-rose-200/90">
                Tiket ini telah diarsipkan oleh panitia dan tidak dapat digunakan untuk check-in masuk acara.
              </p>
            </div>
          </div>
        )}

        {/* Main E-Ticket Pass: Vintage Cinema Theater Ticket */}
        <div className="relative rounded-3xl bg-gradient-to-br from-memoria-dark-wine via-[#1f050a] to-[#140205] border-2 border-memoria-gold/50 shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black">
          {/* Perforated Cutouts */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-memoria-midnight border-2 border-memoria-gold/50 z-10 print:hidden" />
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-memoria-midnight border-2 border-memoria-gold/50 z-10 print:hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-memoria-gold/30">
            {/* LEFT / MAIN SECTION (8 COLS) */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
              {/* Event & Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-memoria-gold/20 pb-4">
                <div>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-memoria-gold">
                    ADMISSION PASS • {ticket.eventName}
                  </span>
                  <h1
                    style={{ fontFamily: 'var(--font-bodoni), serif' }}
                    className="text-2xl sm:text-3xl font-bold text-memoria-ivory print:text-black"
                  >
                    {ticket.ticketTypeName}
                  </h1>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-memoria-champagne/70 block">
                    NO. TIKET
                  </span>
                  <span className="text-sm sm:text-base font-mono font-bold text-memoria-gold">
                    {ticket.ticketNumber}
                  </span>
                </div>
              </div>

              {/* Attendee Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                    NAMA LENGKAP
                  </span>
                  <p className="text-sm font-bold text-memoria-ivory print:text-black mt-0.5">
                    {ticket.fullName}
                  </p>
                </div>

                <div>
                  <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                    NIM (NOMOR INDUK MAHASISWA)
                  </span>
                  <p className="text-sm font-mono font-bold text-memoria-gold print:text-black mt-0.5">
                    {ticket.nim}
                  </p>
                </div>

                <div>
                  <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                    PROGRAM STUDI
                  </span>
                  <p className="font-medium text-memoria-ivory print:text-black mt-0.5">
                    {ticket.studyProgram}
                  </p>
                </div>

                <div>
                  <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                    FAKULTAS
                  </span>
                  <p className="font-medium text-memoria-ivory print:text-black mt-0.5">
                    {ticket.faculty}
                  </p>
                </div>
              </div>

              {/* Event Time & Venue */}
              <div className="pt-4 border-t border-memoria-gold/20 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <CalendarBlank size={16} className="text-memoria-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                      WAKTU ACARA
                    </span>
                    <span className="font-semibold text-memoria-ivory print:text-black">
                      {formatWibDateTime(ticket.eventStartAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-memoria-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-memoria-champagne/60 text-[10px] font-mono uppercase block">
                      LOKASI & VENUE
                    </span>
                    <span className="font-semibold text-memoria-ivory print:text-black">
                      {ticket.venueName}
                    </span>
                    <span className="text-memoria-champagne/70 block text-[11px]">
                      {ticket.venueAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill & Footer note */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-memoria-champagne/60 border-t border-memoria-gold/15">
                <span className="font-mono">HARGA: GRATIS / Rp0</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                    isArchived
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {isArchived ? 'DIARSIPKAN' : 'STATUS: RESMI & VALID'}
                </span>
              </div>
            </div>

            {/* RIGHT STUB SECTION (4 COLS): QR CODE & CHECKIN PASS */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-between text-center bg-[#140306]/80 print:bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-memoria-gold block">
                  CHECK-IN STUB
                </span>
                <span className="text-xs font-mono font-bold text-memoria-ivory print:text-black">
                  {ticket.ticketNumber}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="my-4 p-3 bg-white rounded-2xl shadow-lg border border-memoria-gold/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Check-in ${ticket.ticketNumber}`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-gray-400">
                    <QrCode size={48} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wider text-memoria-gold uppercase">
                  PINTU MASUK TEATER
                </p>
                <p className="text-[10px] text-memoria-champagne/70 max-w-[180px]">
                  Tunjukkan kode QR ini ke petugas check-in di lokasi acara.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
          <a
            href={`/api/tickets/${ticket.ticketAccessToken}/pdf`}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-md transition-colors"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Unduh PDF Resmi</span>
          </a>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-memoria-gold/40 text-memoria-champagne text-xs font-semibold transition-colors"
          >
            <Printer size={16} />
            <span>Cetak Tiket</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-memoria-gold/40 text-memoria-champagne text-xs font-semibold transition-colors"
          >
            <ShareNetwork size={16} />
            <span>Salin Tautan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TicketViewPage(props: { params: Promise<{ token: string }> }) {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-memoria-black flex items-center justify-center text-memoria-champagne text-xs">
            Memuat E-Ticket...
          </div>
        }
      >
        <TicketViewContent {...props} />
      </Suspense>
    </ToastProvider>
  );
}
