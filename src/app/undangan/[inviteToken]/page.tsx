'use client';

import React, { useEffect, useState, useRef, use, Suspense } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { invitationAdapter, eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { LecturerInvitation, InvitationTemplate, EventContent } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { generateQrDataUrl } from '@/lib/qrCode';
import { formatWibDateOnly, formatWibTimeOnly } from '@/lib/date';
import { EnvelopeSimple, EnvelopeOpen, QrCode, Sparkle, WarningCircle, CalendarBlank, MapPin, House } from '@phosphor-icons/react';

function LecturerInvitationContent({
  params,
}: {
  params: Promise<{ inviteToken: string }>;
}) {
  const resolvedParams = use(params);
  const inviteToken = resolvedParams.inviteToken;

  const [lecturer, setLecturer] = useState<LecturerInvitation | undefined>(undefined);
  const [template, setTemplate] = useState<InvitationTemplate>(mockStore.getInvitationTemplate());
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Envelope state: 'CLOSED' | 'OPENING' | 'OPENED'
  const [envelopeState, setEnvelopeState] = useState<'CLOSED' | 'OPENING' | 'OPENED'>('CLOSED');

  const containerRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const qrSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);
    invitationAdapter.getTemplate().then(setTemplate);
    invitationAdapter.getLecturerByToken(inviteToken).then((lec) => {
      setLecturer(lec);
      if (lec) {
        generateQrDataUrl(lec.checkinQrToken).then(setQrDataUrl);
      }
      setLoading(false);
    });
  }, [inviteToken]);

  const handleOpenEnvelope = () => {
    if (envelopeState !== 'CLOSED') return;
    setEnvelopeState('OPENING');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setEnvelopeState('OPENED');
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setEnvelopeState('OPENED');
      },
    });

    // 1. Seal pulses and fades
    tl.to(sealRef.current, { scale: 1.25, opacity: 0, duration: 0.4, ease: 'power2.out' })
      // 2. Flap rotates open upwards
      .to(
        flapRef.current,
        {
          rotateX: 180,
          duration: 0.8,
          ease: 'power2.inOut',
          transformOrigin: 'top center',
        },
        '-=0.1'
      )
      // 3. Letter slides up out of envelope pocket
      .to(
        letterRef.current,
        {
          y: -180,
          scale: 1.05,
          duration: 0.9,
          ease: 'power3.out',
        },
        '-=0.3'
      );
  };

  const handleScrollToQr = () => {
    qrSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4 font-mono text-xs">
        Memuat surat undangan kehormatan...
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="max-w-md text-center p-8 rounded-3xl bg-memoria-dark-wine/70 border border-memoria-gold/30 space-y-4 shadow-2xl">
          <WarningCircle size={48} className="text-rose-400 mx-auto" />
          <h1 className="text-xl font-bold">Undangan Tidak Ditemukan</h1>
          <p className="text-xs text-memoria-champagne/80">
            Tautan undangan personal dosen tidak valid atau telah diperbarui oleh panitia.
          </p>
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

  // Replace variable in template
  const personalizedGreeting = template.greeting.replace('{{nama_dosen}}', lecturer.name);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-memoria-midnight via-[#190508] to-memoria-midnight text-memoria-ivory py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between"
    >
      {/* Top Brand */}
      <div className="text-center pt-2">
        <BrandLogotype size="md" showSubtitle={false} />
      </div>

      {/* INTERACTIVE ENVELOPE SCENE (WHEN CLOSED OR OPENING) */}
      {envelopeState !== 'OPENED' ? (
        <div className="my-auto py-12 flex flex-col items-center gap-8 max-w-lg w-full">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-memoria-gold font-semibold">
              UNDANGAN KEHORMATAN DOSEN
            </span>
            <h1
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
            >
              Yth. {lecturer.name}
            </h1>
            <p className="text-xs text-memoria-champagne/80">
              Silakan sentuh atau klik tombol di bawah untuk membuka amplop resmi.
            </p>
          </div>

          {/* Realistic 3D Interactive Velvet Envelope Container */}
          <div className="relative w-80 sm:w-96 h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-[#400c14] to-[#1c0408] border-2 border-memoria-gold/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] perspective-[1000px] flex items-center justify-center overflow-visible">
            {/* Inside Paper Letter (partially hidden inside pocket) */}
            <div
              ref={letterRef}
              className="absolute w-[88%] h-44 sm:h-52 rounded-xl bg-[#fff9f0] border border-memoria-gold/40 shadow-inner flex flex-col items-center justify-center text-center p-4 z-10"
            >
              <div className="text-[10px] font-mono tracking-widest text-[#891523] uppercase font-bold">
                DIESNATALIS SIKC 2026
              </div>
              <div className="font-serif text-[#350a10] font-bold text-sm sm:text-base mt-1">
                MEMORIA — Velvet Night
              </div>
              <div className="w-12 h-[1px] bg-memoria-gold my-2" />
              <div className="text-[10px] text-[#553338] italic">
                Surat Kehormatan untuk {lecturer.name}
              </div>
            </div>

            {/* Envelope Pocket Body (Front side) */}
            <div
              className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
              style={{
                clipPath: 'polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)',
                background:
                  'linear-gradient(145deg, #660e18 0%, #891523 40%, #4a0911 100%)',
                boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.5)',
              }}
            />

            {/* Flap Triangle (Opens upwards) */}
            <div
              ref={flapRef}
              className="absolute inset-x-0 top-0 h-1/2 z-30 pointer-events-none"
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                background: 'linear-gradient(180deg, #891523 0%, #540c14 100%)',
                transformStyle: 'preserve-3d',
              }}
            />

            {/* Gold Wax Seal (Center of flap) */}
            <div
              ref={sealRef}
              onClick={handleOpenEnvelope}
              className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-[#99732b] via-[#d6b46a] to-[#ffecb3] border-2 border-[#fff2cc] shadow-[0_4px_18px_rgba(214,180,106,0.9)] z-40 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            >
              <span className="font-serif font-black text-xs text-[#24080b] tracking-wider">
                SIKC
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleOpenEnvelope}
            disabled={envelopeState === 'OPENING'}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <EnvelopeSimple size={18} weight="fill" className="text-memoria-gold" />
            <span>{envelopeState === 'OPENING' ? 'Membuka Surat...' : 'Buka Undangan'}</span>
          </button>
        </div>
      ) : (
        /* OPENED STATE: FULL FORMAL INVITATION LETTER */
        <div className="max-w-2xl mx-auto w-full my-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-end">
            <button
              onClick={handleScrollToQr}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/50 text-memoria-gold text-xs font-semibold hover:border-memoria-gold shadow-md"
            >
              <QrCode size={16} />
              <span>Lihat QR Undangan</span>
            </button>
          </div>

          {/* Warm Ivory Formal Letter Paper */}
          <div className="rounded-3xl bg-[#fffaf2] text-[#291417] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-memoria-gold/60 space-y-6 relative overflow-hidden">
            {/* Art Deco Corner Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-memoria-gold" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-memoria-gold" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-memoria-gold" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-memoria-gold" />

            {/* Letterhead */}
            <div className="text-center border-b border-memoria-gold/30 pb-6 space-y-1">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#891523] uppercase font-bold block">
                SURAT UNDANGAN RESMI
              </span>
              <h2
                style={{ fontFamily: 'var(--font-bodoni), serif' }}
                className="text-2xl sm:text-3xl font-bold text-[#350a10]"
              >
                {template.subject}
              </h2>
            </div>

            {/* Greeting */}
            <div className="text-sm sm:text-base font-bold text-[#350a10]">
              {personalizedGreeting}
            </div>

            {/* Body */}
            <div className="text-xs sm:text-sm text-[#4a2e33] leading-relaxed whitespace-pre-line font-normal">
              {template.body}
            </div>

            {/* Event Specifics Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faede6] border border-memoria-gold/40 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarBlank size={18} className="text-[#891523] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#350a10] block">Waktu Acara:</span>
                  <span className="text-[#4a2e33]">
                    {formatWibDateOnly(event.eventStartAt)} • {formatWibTimeOnly(event.eventStartAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#891523] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#350a10] block">Lokasi & Tempat:</span>
                  <span className="text-[#4a2e33]">
                    {event.venueName} — {event.venueAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Closing & Sender */}
            <div className="pt-2 space-y-4 text-xs sm:text-sm">
              <p className="text-[#4a2e33] leading-relaxed">{template.closing}</p>
              <div className="pt-2 text-right">
                <span className="text-[11px] text-[#6b4545] block">Hormat Kami,</span>
                <span className="font-bold text-[#350a10] text-sm block mt-1">
                  {template.senderName}
                </span>
              </div>
            </div>

            {/* QR Check-in Section (Scroll Target) */}
            <div
              ref={qrSectionRef}
              className="pt-8 border-t-2 border-dashed border-memoria-gold/40 flex flex-col items-center text-center gap-3"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#891523]/10 border border-[#891523]/30 text-[#891523] text-xs font-semibold">
                <QrCode size={15} />
                <span>QR CODE KEHADIRAN DOSEN</span>
              </div>

              {qrDataUrl && (
                <div className="p-3 rounded-2xl bg-white border-2 border-memoria-gold shadow-md">
                  <img src={qrDataUrl} alt="QR Kehadiran Dosen" className="w-36 h-36" />
                </div>
              )}

              <div className="text-[11px] font-mono text-[#5c3a3f]">
                KODE UNDANGAN: <span className="font-bold text-[#891523]">{lecturer.inviteCode}</span>
              </div>
              <p className="text-[10px] text-[#6b4545] max-w-sm">
                * Bapak/Ibu dosen tidak perlu melakukan registrasi akun. Cukup tunjukkan QR Code ini
                kepada petugas gerbang teater saat rawuh di lokasi acara.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[11px] text-memoria-champagne/60 py-4 max-w-2xl mx-auto w-full">
        MEMORIA — Diesnatalis SIKC 2026. Undangan Kehormatan Personal.
      </div>
    </div>
  );
}

export default function LecturerInvitationPage(props: { params: Promise<{ inviteToken: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#140809] flex items-center justify-center text-xs text-[#D6B46A]">Menyiapkan amplop undangan...</div>}>
      <LecturerInvitationContent {...props} />
    </Suspense>
  );
}
