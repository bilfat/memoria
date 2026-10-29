import React from 'react';
import Link from 'next/link';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { Sparkle, House, Ticket } from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#140809] text-[#F5E9D3] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#891523]/25 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-2">
          <BrandLogotype size="lg" />
        </div>

        <div className="space-y-2">
          <span className="font-serif text-7xl font-bold tracking-tight text-[#D6B46A] drop-shadow-md">
            404
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#F5E9D3]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-[#F5E9D3]/70 leading-relaxed font-sans">
            Panggung yang Anda cari telah selesai atau alamat URL yang dituju tidak terdaftar dalam
            pertunjukan malam penganugerahan MEMORIA 2026.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D6B46A] hover:bg-[#c4a155] text-[#140809] text-xs font-bold shadow-lg transition-transform hover:scale-105"
          >
            <House size={16} weight="bold" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/daftar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#D6B46A]/50 hover:bg-[#891523]/30 text-[#F5E9D3] text-xs font-bold transition-colors"
          >
            <Ticket size={16} />
            Daftar Tiket Acara
          </Link>
        </div>
      </div>
    </div>
  );
}
