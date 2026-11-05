'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  X,
  EnvelopeSimple,
} from '@phosphor-icons/react';

function TicketViewContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [ticket, setTicket] = useState<TicketViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Deteksi jika diarahkan setelah berhasil membeli tiket (?purchased=1)
  useEffect(() => {
    if (searchParams.get('purchased') === '1') {
      setShowSuccessModal(true);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('purchased');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  }, [searchParams]);

  // Otomatis menutup popup sukses setelah 3.5 detik untuk langsung menampilkan e-ticket web
  useEffect(() => {
    if (!showSuccessModal) return;
    const timer = setTimeout(() => {
      setShowSuccessModal(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

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

        {/* POPUP MODAL TIKET BERHASIL DIBELI (Tampil Otomatis Setelah Pendaftaran & Menutup Sendiri) */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn print:hidden">
            <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#2a070c] via-[#1a0407] to-[#120205] border-2 border-memoria-gold/70 p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(214,180,106,0.35)] space-y-5 animate-scaleUp">
              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-memoria-champagne/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Popup"
              >
                <X size={18} />
              </button>

              {/* Glowing Emerald Checkmark Icon */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-400/60 shadow-inner" />
                <svg
                  className="relative w-14 h-14 text-emerald-400 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]"
                  viewBox="0 0 52 52"
                  fill="none"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    className="checkmark-circle-anim"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 27.5L22.5 35L37.5 18"
                    className="checkmark-check-anim"
                    stroke="#34D399"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40 inline-block">
                  Tiket Berhasil Dipesan!
                </span>
                <h3
                  style={{ fontFamily: 'var(--font-bodoni), serif' }}
                  className="text-2xl font-bold text-memoria-ivory mt-3"
                >
                  Selamat, {ticket.fullName}!
                </h3>
                <p className="text-xs text-memoria-champagne/80 mt-1">
                  Kategori: <strong className="text-memoria-gold">{ticket.ticketTypeName}</strong> • No: <span className="font-mono text-white">{ticket.ticketNumber}</span>
                </p>
              </div>

              {/* Notifikasi Otomatis Terkirim ke Email */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-memoria-gold/30 text-xs text-memoria-champagne/90 space-y-1 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <EnvelopeSimple size={15} weight="bold" />
                  <span>E-Ticket & PDF Otomatis Dikirim ke Email</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Salinan tiket digital dan file PDF resmi telah otomatis dikirimkan ke alamat email <strong className="text-white font-mono">{ticket.email}</strong>.
                </p>
              </div>

              {/* Countdown Progress Bar (Menutup otomatis dalam 3.5 detik) */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full w-full"
                    style={{
                      animation: 'shrinkProgress 3.5s linear forwards',
                    }}
                  />
                </div>
                <p className="text-[10px] text-memoria-champagne/60 font-mono">
                  Menutup otomatis dalam 3 detik untuk menampilkan E-Ticket web...
                </p>
              </div>

              <button
                type="button"
                autoFocus
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-memoria-gold via-amber-300 to-memoria-gold text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer"
              >
                Tampilkan E-Ticket Sekarang
              </button>

              <style jsx>{`
                @keyframes shrinkProgress {
                  from {
                    width: 100%;
                  }
                  to {
                    width: 0%;
                  }
                }
                @keyframes strokeDraw {
                  100% {
                    stroke-dashoffset: 0;
                  }
                }
                @keyframes checkMarkDraw {
                  0% {
                    stroke-dashoffset: 45;
                  }
                  100% {
                    stroke-dashoffset: 0;
                  }
                }
                :global(.checkmark-circle-anim) {
                  stroke-dasharray: 150;
                  stroke-dashoffset: 150;
                  animation: strokeDraw 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                :global(.checkmark-check-anim) {
                  stroke-dasharray: 45;
                  stroke-dashoffset: 45;
                  animation: checkMarkDraw 0.4s 0.35s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
              `}</style>
            </div>
          </div>
        )}
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
