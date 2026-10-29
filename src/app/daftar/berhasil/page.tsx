'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { participantAdapter, ticketAdapter, eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { INITIAL_EVENT_CONTENT } from '@/data/mock/seeds';
import { Participant, TicketIdentity, TicketType, EventContent } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { generateTicketPdf } from '@/lib/ticketPdf';
import { generateQrDataUrl } from '@/lib/qrCode';
import { CheckCircle, DownloadSimple, House, Ticket, QrCode, LockKey, Sparkle } from '@phosphor-icons/react';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const participantId = searchParams.get('participantId');
  const ticketNo = searchParams.get('ticketNo');

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [identity, setIdentity] = useState<TicketIdentity | null>(null);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [event, setEvent] = useState<EventContent>(INITIAL_EVENT_CONTENT);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const { success, info } = useToast();

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);

    // Try reading from sessionStorage first
    try {
      const stored = sessionStorage.getItem('memoria_latest_registration');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.participant && (!participantId || parsed.participant.id === participantId)) {
          setParticipant(parsed.participant);
          setIdentity(parsed.ticketIdentity);
          setTicketType(parsed.ticketType);
          generateQrDataUrl(parsed.ticketIdentity.checkinQrToken).then(setQrDataUrl);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read session registration', e);
    }

    // Fallback: look up by participantId from adapter if valid
    if (participantId) {
      participantAdapter.getParticipant(participantId).then((p) => {
        if (p) {
          setParticipant(p);
          participantAdapter.getTicketIdentity(p.id).then((id) => {
            if (id) {
              setIdentity(id);
              generateQrDataUrl(id.checkinQrToken).then(setQrDataUrl);
            }
          });
          ticketAdapter.getTicket(p.ticketTypeId).then((t) => {
            if (t) setTicketType(t);
          });
        }
      });
    }
  }, [participantId]);

  // Trigger one-time simulated email notification
  useEffect(() => {
    if (participant) {
      setTimeout(() => {
        info(
          'Simulasi Email Terkirim',
          `Salinan e-ticket PDF telah dikirimkan ke ${participant.email}`
        );
      }, 800);
    }
  }, [participant, info]);

  const handleDownloadPdf = async () => {
    if (!participant || !identity || !ticketType || !event) return;
    setDownloading(true);
    try {
      await generateTicketPdf({
        participant,
        ticketIdentity: identity,
        ticketType,
        event,
      });
      success('Tiket Berhasil Diunduh', 'Berkas PDF e-ticket MEMORIA siap digunakan.');
    } catch (err) {
      console.error('Failed generating PDF', err);
    } finally {
      setDownloading(false);
    }
  };

  // Safe state if no session or context found
  if (!participant || !identity || !ticketType) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/40 flex items-center justify-center mx-auto text-memoria-gold">
          <Ticket size={32} />
        </div>
        <h2 className="text-xl font-bold text-memoria-ivory">Sesi Pendaftaran Tidak Ditemukan</h2>
        <p className="text-xs text-memoria-champagne/70 leading-relaxed">
          Tidak ada data pendaftaran aktif pada sesi peramban Anda. Silakan lakukan pendaftaran tiket terlebih dahulu.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-memoria-burgundy text-memoria-ivory text-xs uppercase font-bold"
          >
            <House size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Brand Header */}
      <div className="text-center pt-2">
        <BrandLogotype size="md" showSubtitle={true} />
      </div>

      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mb-2 animate-bounce">
          <CheckCircle size={36} weight="fill" />
        </div>
        <h1
          style={{ fontFamily: 'var(--font-bodoni), serif' }}
          className="text-3xl sm:text-4xl font-bold text-memoria-ivory"
        >
          Pendaftaran Berhasil!
        </h1>
        <p className="text-xs sm:text-sm text-memoria-champagne/80 font-normal">
          Tiket Anda telah terdaftar resmi untuk perayaan MEMORIA — Velvet Night.
        </p>
      </div>

      {/* Ticket Showcase Card */}
      <div className="rounded-3xl bg-gradient-to-br from-memoria-dark-wine to-[#1a0508] border-2 border-memoria-gold/50 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-start border-b border-memoria-gold/25 pb-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-mono text-memoria-gold font-bold">
              OFFICIAL E-TICKET
            </span>
            <h2 className="text-xl font-bold text-memoria-ivory">{ticketType.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] tracking-widest uppercase font-mono text-memoria-champagne/60 block">
              NOMOR TIKET
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-memoria-gold">
              {identity.ticketNo}
            </span>
          </div>
        </div>

        {/* Identity Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-memoria-champagne/60 block text-[10px]">NAMA PESERTA</span>
            <span className="font-bold text-memoria-ivory text-sm">{participant.fullName}</span>
          </div>
          <div>
            <span className="text-memoria-champagne/60 block text-[10px]">NIM MAHASISWA</span>
            <span className="font-bold text-memoria-ivory text-sm">{participant.nim}</span>
          </div>
          <div className="col-span-2 pt-1">
            <span className="text-memoria-champagne/60 block text-[10px]">PROGRAM STUDI & FAKULTAS</span>
            <span className="text-memoria-champagne font-sans text-xs">
              {participant.studyProgram} — {participant.faculty}
            </span>
          </div>
        </div>

        {/* Secret Vote Code Box */}
        <div className="p-4 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-memoria-gold font-bold">
              <LockKey size={14} />
              <span>KODE UNIK VOTING (RAHASIA)</span>
            </div>
            <p className="text-[11px] text-memoria-champagne/70 font-sans leading-tight">
              Simpan kode ini untuk mengakses pemilihan private voting bersama NIM Anda.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-memoria-dark-wine border border-memoria-gold text-memoria-gold font-mono font-bold text-base tracking-wider">
            {identity.voteCode}
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="pt-2 text-center flex flex-col items-center gap-2">
          <span className="text-[11px] text-memoria-champagne/80 font-mono tracking-wider flex items-center gap-1">
            <QrCode size={16} className="text-memoria-gold" />
            <span>QR CODE MASUK ACARA</span>
          </span>
          {qrDataUrl && (
            <div className="p-3 rounded-2xl bg-white shadow-2xl border-2 border-memoria-gold">
              <img src={qrDataUrl} alt="QR Check-in" className="w-36 h-36" />
            </div>
          )}
          <span className="text-[10px] text-memoria-champagne/60 mt-1">
            Tunjukkan QR ini kepada petugas check-in saat hadir di lokasi acara.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-memoria-gold/20 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
          >
            <DownloadSimple size={18} weight="bold" />
            <span>{downloading ? 'Menyiapkan PDF...' : 'Unduh Tiket PDF'}</span>
          </button>
          <Link
            href="/"
            className="py-3.5 px-6 rounded-full bg-memoria-dark-wine/70 border border-memoria-gold/30 hover:border-memoria-gold text-memoria-champagne font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-center"
          >
            <House size={16} />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-12 px-4 sm:px-6 lg:px-8">
        <React.Suspense fallback={<div className="text-center py-20">Memuat tiket...</div>}>
          <RegistrationSuccessContent />
        </React.Suspense>
      </div>
    </ToastProvider>
  );
}
