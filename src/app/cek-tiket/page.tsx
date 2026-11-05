'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { ToastProvider } from '@/components/ui/Toast';
import { searchPublicTicketAction, PublicTicketSearchResult } from '@/app/actions/tickets';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, MagnifyingGlass, Ticket, CheckCircle, WarningCircle, User, IdentificationBadge } from '@phosphor-icons/react';

export default function CekTiketPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicTicketSearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await searchPublicTicketAction(identifier.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        found: false,
        message: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Supabase Realtime: jika hasil tiket sedang tampil, perbarui status check-in secara live
  React.useEffect(() => {
    if (!result?.ticket?.ticketAccessToken) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:cek-tiket-${result.ticket.ticketAccessToken}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          searchPublicTicketAction(identifier.trim()).then((res) => {
            if (res.found) setResult(res);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          searchPublicTicketAction(identifier.trim()).then((res) => {
            if (res.found) setResult(res);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [result?.ticket?.ticketAccessToken, identifier]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header Nav */}
          <div className="flex items-center justify-between border-b border-memoria-gold/20 pb-5">
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
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-memoria-dark-wine/70 border border-memoria-gold/30 text-memoria-gold text-xs uppercase tracking-widest">
              <Ticket size={14} weight="fill" />
              <span>Pencarian Tiket</span>
            </div>
            <h1
              style={{ fontFamily: 'var(--font-bodoni), serif' }}
              className="text-3xl sm:text-4xl font-bold text-memoria-ivory"
            >
              Cek Status Tiket Anda
            </h1>
            <p className="text-xs sm:text-sm text-memoria-champagne/80 max-w-md mx-auto">
              Cari tiket resmi Anda dengan memasukkan <strong>NIM Mahasiswa</strong> atau <strong>ID Order / Nomor Tiket</strong>.
            </p>
          </div>

          {/* Search Form Card */}
          <form
            onSubmit={handleSearch}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2a070c] via-[#1a0407] to-[#120205] border-2 border-memoria-gold/50 shadow-2xl space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-[#f5d890] uppercase tracking-wider mb-2">
                NIM ATAU NOMOR TIKET (ID ORDER)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: 6706220015 atau MMR-691254-3844"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/60 border border-[#d6b46a]/50 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#f5d890] focus:ring-1 focus:ring-[#f5d890]"
                />
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-memoria-gold/70"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                * Sistem akan mencari data tiket aktif maupun arsip berdasarkan NIM atau kode tiket.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] hover:from-[#9e1c2c] hover:to-[#720e1a] border border-[#f5d890]/80 text-[#fffbf0] font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mencari Data Tiket...' : 'Cari Tiket Sekarang'}
            </button>
          </form>

          {/* Search Result */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {result.found && result.ticket ? (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1e0508] to-[#120205] border-2 border-emerald-500/50 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle size={20} weight="fill" />
                      <span>Tiket Resmi Ditemukan</span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        result.ticket.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      }`}
                    >
                      {result.ticket.status === 'active' ? 'Status: Aktif' : 'Status: Diarsipkan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase block">Nama Peserta</span>
                      <span className="font-bold text-white text-sm block font-sans">{result.ticket.fullName}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase block">NIM Mahasiswa</span>
                      <span className="font-bold text-[#f5d890] text-sm block">{result.ticket.nim}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase block">No. Tiket / ID Order</span>
                      <span className="font-bold text-white block">{result.ticket.ticketNumber}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase block">Kategori Tiket</span>
                      <span className="font-bold text-[#f5d890] block">{result.ticket.ticketTypeName}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/tiket/${result.ticket.ticketAccessToken}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#891523] hover:bg-[#a11a2a] border border-[#f5d890] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer"
                    >
                      <Ticket size={16} weight="fill" className="text-[#f5d890]" />
                      <span>Buka E-Ticket Lengkap & QR Code</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
                    <WarningCircle size={22} weight="fill" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Tiket Tidak Ditemukan</h3>
                  <p className="text-xs text-rose-200/80 max-w-md mx-auto leading-relaxed">
                    {result.message || 'Data tiket tidak ditemukan. Pastikan NIM atau Nomor Tiket (ID Order) yang Anda ketikkan sudah sesuai.'}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </ToastProvider>
  );
}

