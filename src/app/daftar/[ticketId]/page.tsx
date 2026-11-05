'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPublicTicketsAction, TicketTypePublicDTO } from '@/app/actions/tickets';
import { TELKOM_FACULTIES, TelkomFaculty } from '@/lib/validations';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ArrowLeft, Ticket, WarningCircle } from '@phosphor-icons/react';

function TicketRegistrationContent({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId;
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketTypePublicDTO | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [faculty, setFaculty] = useState<TelkomFaculty>('Fakultas Ilmu Terapan');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTicket(true);
    getPublicTicketsAction()
      .then((tickets) => {
        const found = tickets.find((t) => t.id === ticketId);
        setTicket(found || null);
      })
      .finally(() => {
        setLoadingTicket(false);
      });
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side comprehensive field validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Nama lengkap minimal 3 karakter.');
      return;
    }
    if (!/^[0-9]{5,20}$/.test(nim.trim())) {
      setErrorMessage('NIM harus berupa 5 sampai 20 digit angka.');
      return;
    }
    if (!studyProgram.trim()) {
      setErrorMessage('Program studi wajib diisi.');
      return;
    }
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (!/^(\+62|62|0)[0-9]{9,13}$/.test(cleanPhone)) {
      setErrorMessage('Nomor WhatsApp / HP tidak valid (minimal 10 digit angka, diawali 08, 62, atau +62).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Format alamat email tidak valid (contoh: nama@domain.com).');
      return;
    }

    setSubmitting(true);
    try {
      // Generate client-side idempotency key for network retry safety
      const idempotencyKey = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketId,
          fullName: fullName.trim(),
          nim: nim.trim(),
          studyProgram: studyProgram.trim(),
          faculty,
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          idempotencyKey,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(
          json.error?.message || 'Pendaftaran tiket tidak dapat diproses. Silakan coba lagi.'
        );
        setSubmitting(false);
        return;
      }

      // Success: langsung arahkan ke halaman E-Ticket di web dengan notifikasi popup berhasil
      const token = json.data.ticketAccessToken;
      router.push(`/tiket/${encodeURIComponent(token)}?purchased=1`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan jaringan saat mendaftar tiket.');
      setSubmitting(false);
    }
  };

  if (loadingTicket) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-memoria-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-memoria-champagne/80 font-mono">Memeriksa ketersediaan tiket...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !ticket.isAvailable) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-3xl bg-memoria-dark-wine/30 border border-memoria-gold/30">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto">
            <WarningCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-memoria-ivory">Tiket Tidak Tersedia</h2>
          <p className="text-xs text-memoria-champagne/80 leading-relaxed">
            {ticket
              ? `Pendaftaran untuk kategori "${ticket.name}" saat ini berstatus ${ticket.derivedStatusLabel}.`
              : 'Kategori tiket tidak ditemukan atau telah ditutup oleh panitia.'}
          </p>
          <div className="pt-2">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-memoria-burgundy hover:bg-memoria-stage-red border border-memoria-gold/60 text-memoria-ivory text-xs uppercase font-bold"
            >
              <ArrowLeft size={16} />
              <span>Kembali Pilih Tiket</span>
            </Link>
          </div>
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
            className="inline-flex items-center gap-2 text-xs text-memoria-champagne/80 hover:text-memoria-gold transition-colors py-1.5 px-3.5 rounded-full border border-memoria-gold/30 hover:border-memoria-gold"
          >
            <ArrowLeft size={14} />
            <span>Ganti Jenis Tiket</span>
          </Link>
          <BrandLogotype size="sm" showSubtitle={false} />
        </div>

        {/* Ticket Summary Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-memoria-dark-wine to-[#24080b] border border-memoria-gold/40 shadow-lg flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-memoria-gold font-semibold">
              TIKET PILIHAN
            </span>
            <h2
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-xl font-bold text-memoria-ivory mt-0.5"
            >
              {ticket.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-memoria-champagne/80 font-mono">
              <span className="text-emerald-400 font-semibold">Gratis (Rp0)</span>
              <span>•</span>
              <span className="text-[#f5d890]">Tiket Resmi Mahasiswa</span>
            </div>
          </div>
          <Ticket size={36} weight="duotone" className="text-memoria-gold shrink-0" />
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

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nama Lengkap */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
                NAMA LENGKAP <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Muhammad Nabil"
                className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
              />
            </div>

            {/* NIM */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
                NIM (NOMOR INDUK MAHASISWA) <span className="text-rose-400">*</span>
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
                * 1 NIM hanya dapat memiliki 1 tiket untuk seluruh perayaan MEMORIA.
              </span>
            </div>

            {/* Program Studi (Free Text) */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
                PROGRAM STUDI <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studyProgram}
                onChange={(e) => setStudyProgram(e.target.value)}
                placeholder="Contoh: D4 Sistem Informasi Kota Cerdas"
                className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
              />
            </div>

            {/* Fakultas (8 Fakultas Telkom Dropdown) */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
                FAKULTAS (UNIVERSITAS TELKOM) <span className="text-rose-400">*</span>
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value as TelkomFaculty)}
                className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
              >
                {TELKOM_FACULTIES.map((fac) => (
                  <option key={fac} value={fac} className="bg-neutral-900 text-white">
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Nomor WhatsApp / HP */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
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
              <span className="text-[11px] text-memoria-champagne/60 mt-1 block">
                * Minimal 10 digit angka (contoh: 08123456789).
              </span>
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-memoria-champagne mb-1.5">
                EMAIL MAHASISWA <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: nabil@student.telkomuniversity.ac.id"
                className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm focus:outline-none focus:border-memoria-gold focus:ring-1 focus:ring-memoria-gold transition-colors"
              />
              <span className="text-[11px] text-memoria-champagne/70 mt-1 block">
                * Tiket & QR Code akan dikirim ke email ini. <strong>1 email dapat digunakan untuk memesan tiket lebih dari 1 peserta/NIM</strong>.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Memproses Reservasi Tiket...</span>
                ) : (
                  <>
                    <Ticket size={20} weight="fill" className="text-memoria-gold" />
                    <span>Daftar Tiket Sekarang</span>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#140809] flex items-center justify-center text-xs text-[#D6B46A]">
          Memuat tiket...
        </div>
      }
    >
      <TicketRegistrationContent {...props} />
    </Suspense>
  );
}
