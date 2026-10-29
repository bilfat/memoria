'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ticketAdapter, participantAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { TicketType } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Ticket, WarningCircle, CheckCircle, Lock } from '@phosphor-icons/react';

function TicketRegistrationContent({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId;
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketType | undefined>(undefined);
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    ticketAdapter.getTicket(ticketId).then((t) => {
      setTicket(t);
    });
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic format checks
    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!nim.trim()) {
      setErrorMessage('NIM wajib diisi.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('Nomor HP tidak valid. Masukkan minimal 8 digit.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Format email belum sesuai.');
      return;
    }

    setLoading(true);
    try {
      const result = await participantAdapter.register({
        fullName,
        nim,
        email,
        phone,
        ticketTypeId: ticketId,
      });

      // Navigate to success page with session reference
      sessionStorage.setItem(
        'memoria_latest_registration',
        JSON.stringify({
          participant: result.participant,
          ticketIdentity: result.ticketIdentity,
          ticketType: ticket,
        })
      );

      router.push(
        `/daftar/berhasil?ticketNo=${encodeURIComponent(
          result.ticketIdentity.ticketNo
        )}&participantId=${encodeURIComponent(result.participant.id)}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat pendaftaran.');
      setLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-rose-400">Jenis tiket tidak ditemukan atau tidak tersedia.</p>
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-memoria-burgundy text-memoria-ivory text-xs uppercase font-bold"
          >
            <ArrowLeft size={16} />
            <span>Kembali Pilih Tiket</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-memoria-gold/20 pb-5">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 text-xs text-memoria-champagne/80 hover:text-memoria-gold transition-colors py-1 px-3 rounded-full border border-memoria-gold/30"
            >
              <ArrowLeft size={14} />
              <span>Ganti Jenis Tiket</span>
            </Link>
            <BrandLogotype size="sm" showSubtitle={false} />
          </div>

          {/* Ticket Summary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-memoria-dark-wine to-[#24080b] border border-memoria-gold/40 shadow-lg flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-memoria-gold">
                TIKET PILIHAN
              </span>
              <h2 className="text-lg font-bold text-memoria-ivory">{ticket.name}</h2>
              <span className="text-xs text-memoria-champagne/80 font-mono">
                Status: GRATIS (Rp0)
              </span>
            </div>
            <Ticket size={32} weight="duotone" className="text-memoria-gold shrink-0" />
          </div>

          {/* Form Card */}
          <div className="rounded-3xl bg-[#1b080b]/90 border border-memoria-gold/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <h1
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-2xl sm:text-3xl font-bold text-memoria-ivory text-center mb-6"
            >
              Formulir Pendaftaran Tiket
            </h1>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-600/50 flex items-start gap-3 text-xs text-rose-200">
                <WarningCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                  NAMA LENGKAP <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
                />
              </div>

              {/* NIM */}
              <div>
                <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                  NIM MAHASISWA <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Contoh: 7708220001"
                  className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm font-mono focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
                />
                <span className="text-[11px] text-memoria-champagne/60 mt-1 block">
                  * 1 NIM hanya dapat digunakan untuk 1 tiket seluruh rangkaian MEMORIA.
                </span>
              </div>

              {/* Locked Program Studi & Fakultas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-memoria-champagne mb-1.5 flex items-center gap-1">
                    <span>PROGRAM STUDI</span>
                    <Lock size={12} className="text-memoria-gold/70" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value="D4 Sistem Informasi Kota Cerdas"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-memoria-midnight/50 border border-memoria-gold/20 text-memoria-champagne/70 text-xs font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-memoria-champagne mb-1.5 flex items-center gap-1">
                    <span>FAKULTAS</span>
                    <Lock size={12} className="text-memoria-gold/70" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Fakultas Ilmu Terapan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-memoria-midnight/50 border border-memoria-gold/20 text-memoria-champagne/70 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp / HP */}
              <div>
                <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                  NOMOR WHATSAPP / HP <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm font-mono focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                  EMAIL MAHASISWA <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: andi@student.telkomuniversity.ac.id"
                  className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
                />
                <span className="text-[11px] text-memoria-champagne/60 mt-1 block">
                  * Salinan e-ticket PDF juga akan dikirimkan ke alamat email ini.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Memproses Reservasi Tiket...</span>
                  ) : (
                    <>
                      <Ticket size={20} weight="fill" className="text-memoria-gold" />
                      <span>Daftar Tiket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default function TicketRegistrationPage(props: { params: Promise<{ ticketId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#140809] flex items-center justify-center text-xs text-[#D6B46A]">Memuat tiket...</div>}>
      <TicketRegistrationContent {...props} />
    </Suspense>
  );
}
