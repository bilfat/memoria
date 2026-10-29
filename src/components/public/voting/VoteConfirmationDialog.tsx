'use client';

import React from 'react';
import { Candidate } from '@/types';
import { Sparkle, WarningCircle, Check, X } from '@phosphor-icons/react';

interface VoteConfirmationDialogProps {
  candidate: Candidate;
  onCancel: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

/**
 * VoteConfirmationDialog
 * Dialog konfirmasi sebelum suara resmi dicatat:
 * - Menampilkan preview kandidat & nama
 * - Peringatan tegas bahwa suara final dan tidak dapat diubah
 * - Tombol Batal & Konfirmasi Vote
 */
export function VoteConfirmationDialog({
  candidate,
  onCancel,
  onConfirm,
  submitting = false,
}: VoteConfirmationDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#350a10] via-[#1f060a] to-[#140809] border-2 border-[#d6b46a]/60 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(214,180,106,0.25)] text-center space-y-5 animate-in zoom-in-95 duration-250">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="absolute top-4 right-4 p-2 rounded-full text-[#eacfa4]/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Tutup dialog"
        >
          <X size={18} />
        </button>

        {/* Top Gold Badge */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#891523] to-[#350a10] border border-[#d6b46a]/60 shadow-[0_0_20px_rgba(214,180,106,0.35)] flex items-center justify-center mx-auto text-[#f5d890]">
          <Sparkle size={26} weight="fill" />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#d6b46a] uppercase font-semibold">
            KONFIRMASI PILIHAN
          </span>
          <h2
            id="confirm-dialog-title"
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-2xl sm:text-3xl font-bold text-[#f5e9d3]"
          >
            Konfirmasi Pilihanmu
          </h2>
        </div>

        {/* Candidate Preview Card */}
        <div className="p-4 rounded-2xl bg-[#140809]/80 border border-[#d6b46a]/30 flex items-center gap-4 text-left">
          {candidate.photo ? (
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black/40 border border-[#d6b46a]/40 shrink-0">
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <div className="w-16 h-20 rounded-xl bg-[#350a10] border border-[#d6b46a]/30 flex items-center justify-center shrink-0 text-[#d6b46a]">
              <Sparkle size={24} weight="fill" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d6b46a]/80 block">
              Kandidat Terpilih
            </span>
            <h4
              style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
              className="text-lg font-bold text-[#f5e9d3] truncate"
            >
              {candidate.name}
            </h4>
            <p className="text-xs text-[#eacfa4]/70 line-clamp-2 mt-0.5">
              {candidate.description || 'Nominee panggung peragaan busana & malam Diesnatalis.'}
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <p className="text-xs text-[#eacfa4]/80 leading-relaxed px-2">
          Apakah kamu yakin ingin memberikan suara kepada{' '}
          <strong className="text-[#f5d890]">{candidate.name}</strong>?
          <span className="block mt-1 text-[11px] text-rose-300 font-medium">
            * Pilihan ini bersifat final dan tidak dapat diubah kembali setelah dikirim.
          </span>
        </p>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-[#140809] border border-[#d6b46a]/40 text-xs font-semibold text-[#eacfa4] hover:bg-[#350a10] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] border border-[#d6b46a] text-xs font-bold text-white uppercase tracking-wider shadow-[0_4px_20px_rgba(181,39,53,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Mencatat...</span>
              </>
            ) : (
              <>
                <Check size={16} weight="bold" />
                <span>Konfirmasi Vote</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

