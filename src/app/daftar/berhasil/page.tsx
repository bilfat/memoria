'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getTicketViewDataAction } from '@/app/actions/tickets';
import type { TicketViewData } from '@/lib/ticketData';
import { generateQrDataUrl } from '@/lib/qrCode';
import { formatWibDateTime } from '@/lib/date';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider } from '@/components/ui/Toast';
import {
  CheckCircle,
  DownloadSimple,
  Ticket,
  QrCode,
  ArrowRight,
  House,
  EnvelopeSimple,
} from '@phosphor-icons/react';

function RegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      router.replace(`/tiket/${encodeURIComponent(token)}?purchased=1`);
    }
  }, [token, router]);

  const [ticket, setTicket] = useState<TicketViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getTicketViewDataAction(token)
      .then((data) => {
        setTicket(data);
        if (data?.qrToken) {
          generateQrDataUrl(data.qrToken).then(setQrDataUrl);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-memoria-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-memoria-champagne/80 font-mono">Memuat konfirmasi tiket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto space-y-4 p-8 rounded-3xl bg-memoria-dark-wine/30 border border-memoria-gold/30">
          <Ticket size={40} className="text-memoria-gold/60 mx-auto" />
          <h2 className="text-lg font-bold text-memoria-ivory">Tiket Tidak Ditemukan</h2>
          <p className="text-xs text-memoria-champagne/80">
            Data tiket tidak ditemukan atau parameter tautan pendaftaran tidak lengkap.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-memoria-burgundy text-white text-xs font-semibold"
            >
              <House size={16} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand header */}
        <div className="flex items-center justify-between border-b border-memoria-gold/20 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-memoria-champagne/80 hover:text-memoria-gold transition-colors py-1.5 px-3.5 rounded-full border border-memoria-gold/30"
          >
            <House size={14} />
            <span>Beranda</span>
          </Link>
          <BrandLogotype size="sm" showSubtitle={false} />
        </div>

        {/* Success Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#24080d] via-[#1a0508] to-[#120204] border border-memoria-gold/40 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Success Icon & Heading */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle size={36} weight="fill" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-memoria-gold block">
              RESERVASI BERHASIL
            </span>
            <h1
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
            >
              Tiket Anda Telah Terbit!
            </h1>
            <p className="text-xs text-memoria-champagne/80 max-w-md mx-auto leading-relaxed">
              Selamat, tiket resmi MEMORIA Anda telah terdaftar dalam sistem. Simpan kode QR ini untuk proses check-in di pintu masuk panggung.
            </p>
          </div>

          {/* Ticket Summary Box */}
          <div className="p-5 rounded-2xl bg-memoria-midnight/80 border border-memoria-gold/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-memoria-gold/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-memoria-champagne/60 uppercase block">
                  KATEGORI TIKET
                </span>
                <span className="text-sm font-bold text-memoria-ivory">
                  {ticket.ticketTypeName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-memoria-champagne/60 uppercase block">
                  NO. TIKET
                </span>
                <span className="text-sm font-mono font-bold text-memoria-gold">
                  {ticket.ticketNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-memoria-champagne/60 uppercase font-mono block">
                  NAMA MAHASISWA
                </span>
                <span className="font-semibold text-memoria-ivory">{ticket.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-memoria-champagne/60 uppercase font-mono block">
                  NIM
                </span>
                <span className="font-mono font-bold text-memoria-gold">{ticket.nim}</span>
              </div>
              <div>
                <span className="text-[10px] text-memoria-champagne/60 uppercase font-mono block">
                  PROGRAM STUDI
                </span>
                <span className="text-memoria-champagne/90">{ticket.studyProgram}</span>
              </div>
              <div>
                <span className="text-[10px] text-memoria-champagne/60 uppercase font-mono block">
                  FAKULTAS
                </span>
                <span className="text-memoria-champagne/90">{ticket.faculty}</span>
              </div>
            </div>

            {/* Event schedule */}
            <div className="pt-3 border-t border-memoria-gold/15 text-xs flex flex-col gap-1">
              <div className="text-memoria-champagne/70 text-[11px]">
                <strong className="text-memoria-gold">Waktu:</strong>{' '}
                {formatWibDateTime(ticket.eventStartAt)}
              </div>
              <div className="text-memoria-champagne/70 text-[11px]">
                <strong className="text-memoria-gold">Lokasi:</strong> {ticket.venueName} —{' '}
                {ticket.venueAddress}
              </div>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="p-6 rounded-2xl bg-[#140306] border border-memoria-gold/30 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-memoria-gold">
              QR CODE CHECK-IN RESMI
            </span>
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${ticket.ticketNumber}`}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-gray-400">
                  <QrCode size={40} />
                </div>
              )}
            </div>
            <p className="text-[11px] text-memoria-champagne/70 max-w-xs">
              Tunjukkan kode QR ini secara langsung dari layar ponsel Anda atau cetak pada kertas saat tiba di lokasi.
            </p>
          </div>

          {/* Email notice (honest queue) */}
          <div className="p-3.5 rounded-xl bg-memoria-midnight/60 border border-memoria-gold/20 flex items-center gap-3 text-xs text-memoria-champagne/80">
            <EnvelopeSimple size={20} className="text-memoria-gold shrink-0" />
            <span>
              Konfirmasi tiket dan salinan digital telah dijadwalkan ke antrean pengiriman email penerima (
              <strong className="text-memoria-ivory">{ticket.email}</strong>).
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/tiket/${ticket.ticketAccessToken}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Ticket size={16} weight="fill" />
              <span>Buka E-Ticket Digital</span>
              <ArrowRight size={14} />
            </Link>

            <a
              href={`/api/tickets/${ticket.ticketAccessToken}/pdf`}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-memoria-gold/40 text-memoria-champagne font-semibold text-xs tracking-wider transition-colors"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>Unduh Berkas PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-memoria-midnight flex items-center justify-center text-xs text-[#D6B46A]">
            Memuat konfirmasi tiket...
          </div>
        }
      >
        <RegistrationSuccessContent />
      </Suspense>
    </ToastProvider>
  );
}
