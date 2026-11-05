'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { searchPublicTicketAction, PublicTicketSearchResult } from '@/app/actions/tickets';
import { createClient } from '@/lib/supabase/client';
import {
  Ticket,
  MagnifyingGlass,
  X,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  Sparkle,
  IdentificationBadge,
} from '@phosphor-icons/react';

interface CekTiketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CekTiketModal({ isOpen, onClose }: CekTiketModalProps) {
  const [mounted, setMounted] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicTicketSearchResult | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setIdentifier('');
      setResult(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Tutup dengan tombol Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Supabase Realtime: jika hasil tiket sedang tampil, perbarui status check-in secara live
  useEffect(() => {
    if (!isOpen || !result?.ticket?.ticketAccessToken) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:modal-cek-tiket-${result.ticket.ticketAccessToken}`)
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
  }, [isOpen, result?.ticket?.ticketAccessToken, identifier]);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cek-tiket-title"
      className="fixed inset-0 z-[999999] overflow-y-auto"
    >
      {/* 1. BACKDROP WITH SMOOTH FADE & BLUR */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* Styles for Theatrical Stage Smoke / Fog Billowing from the bottom */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fog-drift-left {
          0%, 100% {
            transform: translateX(-8%) scaleY(1);
            opacity: 0.55;
          }
          50% {
            transform: translateX(10%) scaleY(1.2);
            opacity: 0.85;
          }
        }
        @keyframes fog-drift-right {
          0%, 100% {
            transform: translateX(8%) scaleY(1.15);
            opacity: 0.5;
          }
          50% {
            transform: translateX(-10%) scaleY(0.9);
            opacity: 0.8;
          }
        }
        @keyframes fog-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08) translateY(-6px);
          }
        }
        .animate-modal-pop {
          animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fog-layer-1 {
          animation: fog-drift-left 7s ease-in-out infinite;
        }
        .fog-layer-2 {
          animation: fog-drift-right 9s ease-in-out infinite;
        }
        .fog-layer-3 {
          animation: fog-pulse 5s ease-in-out infinite;
        }
      `}</style>

      {/* 2. THE MODAL CARD WITH LUXURY VELVET THEATRE DESIGN - Centered with min-h-full to prevent vertical cutoff */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative pointer-events-none">
        <div className="relative pointer-events-auto z-10 w-full max-w-lg my-auto bg-[#18060B] border border-[#d6b46a]/50 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(214,180,106,0.18)] overflow-hidden animate-modal-pop text-memoria-ivory">
        
        {/* Top Gold Shimmer Border Trim */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5d890] to-transparent shadow-[0_0_10px_rgba(245,216,144,0.8)]" />

        {/* ========================================================= */}
        {/* THEATRICAL SMOKE / FOG BILLOWING AT THE BOTTOM */}
        {/* ========================================================= */}
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none overflow-hidden z-0">
          {/* Deep Velvet Wine Fog Reservoir */}
          <div
            className="fog-layer-1 absolute -bottom-10 -inset-x-12 h-36 blur-2xl"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(181, 39, 53, 0.45) 0%, rgba(137, 21, 35, 0.25) 45%, transparent 75%)',
            }}
          />

          {/* Golden Stage Mist Plume Left */}
          <div
            className="fog-layer-2 absolute -bottom-8 -left-8 w-[120%] h-32 blur-xl"
            style={{
              background:
                'radial-gradient(ellipse at 30% 100%, rgba(245, 216, 144, 0.35) 0%, rgba(214, 180, 106, 0.15) 50%, transparent 75%)',
            }}
          />

          {/* Golden Stage Mist Plume Right */}
          <div
            className="fog-layer-3 absolute -bottom-6 -right-8 w-[110%] h-28 blur-lg"
            style={{
              background:
                'radial-gradient(ellipse at 70% 100%, rgba(254, 240, 138, 0.28) 0%, rgba(214, 180, 106, 0.12) 45%, transparent 70%)',
            }}
          />

          {/* Subtle Stage Smoke Wisps Accent */}
          <div
            className="absolute bottom-0 inset-x-0 h-16 opacity-75"
            style={{
              background:
                'linear-gradient(to top, rgba(24, 6, 11, 0.95) 0%, rgba(245, 216, 144, 0.08) 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
          aria-label="Tutup popup"
        >
          <X size={18} />
        </button>

        {/* Modal Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#891523]/60 border border-[#d6b46a]/40 text-[#f5d890] text-xs font-mono tracking-widest uppercase">
              <Sparkle size={13} weight="fill" className="text-[#fef08a]" />
              <span>TIKET DIGITAL MEMORIA</span>
            </div>
            <h2
              id="cek-tiket-title"
              style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
              className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
            >
              Cek Status Tiket Anda
            </h2>
            <p className="text-xs text-memoria-champagne/80 max-w-sm mx-auto">
              Cari tiket resmi Anda dengan memasukkan <strong>NIM Mahasiswa</strong> atau <strong>ID Order / Nomor Tiket</strong>.
            </p>
          </div>

          {/* Form Pencarian */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-memoria-gold">
                <MagnifyingGlass size={18} />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIM (contoh: 6706...) atau No. Tiket"
                className="w-full pl-10 pr-4 py-3 bg-[#0d0305]/80 border border-[#d6b46a]/40 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f5d890] focus:ring-1 focus:ring-[#f5d890] transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#f5d890]/80 text-[#fffdfa] font-bold text-xs uppercase tracking-widest shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <MagnifyingGlass size={16} weight="bold" />
              <span>{loading ? 'Mencari Tiket...' : 'Cek Status Sekarang'}</span>
            </button>
          </form>

          {/* Hasil Pencarian */}
          {result && (
            <div className="animate-fadeIn">
              {result.found && result.ticket ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#d6b46a]/50 shadow-xl space-y-3.5 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle size={18} weight="fill" />
                      <span className="font-bold text-xs uppercase tracking-wider">Tiket Ditemukan!</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-neutral-400 uppercase block">Nama Peserta</span>
                      <span className="font-bold text-white text-sm block font-sans truncate">{result.ticket.fullName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-neutral-400 uppercase block">NIM Mahasiswa</span>
                      <span className="font-bold text-[#f5d890] text-sm block">{result.ticket.nim}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-neutral-400 uppercase block">No. Tiket / ID Order</span>
                      <span className="font-bold text-white block truncate">{result.ticket.ticketNumber}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-neutral-400 uppercase block">Kategori Tiket</span>
                      <span className="font-bold text-[#f5d890] block truncate">{result.ticket.ticketTypeName}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/tiket/${result.ticket.ticketAccessToken}`}
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#891523] hover:bg-[#a11a2a] border border-[#f5d890] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Buka E-Ticket & QR Code Lengkap</span>
                      <ArrowRight size={15} weight="bold" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
                  <WarningCircle size={24} weight="fill" className="text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-rose-300">Tiket Tidak Ditemukan</span>
                    <span>{result.message || 'Pastikan NIM atau Nomor Tiket yang dimasukkan sudah benar.'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      </div>
    </div>,
    document.body
  );
}

