'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accountAdapter } from '@/data/adapters';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { Lock, EnvelopeSimple, Eye, EyeSlash, ArrowLeft, WarningCircle, UserCircleGear, QrCode } from '@phosphor-icons/react';

export default function PanitiaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@memoria.telkom.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const user = await accountAdapter.login(email, password);
      if (user.role === 'ADMIN_PANITIA') {
        window.location.href = '/panitia';
      } else {
        window.location.href = '/panitia/check-in';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Email atau password tidak sesuai.');
      setLoading(false);
    }
  };

  const handleFillDemo = (role: 'ADMIN' | 'PETUGAS') => {
    if (role === 'ADMIN') {
      setEmail('admin@memoria.telkom.id');
      setPassword('admin123');
    } else {
      setEmail('petugas@memoria.telkom.id');
      setPassword('petugas123');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between p-4 sm:p-6 text-[#252932] font-sans">
      <div className="max-w-md mx-auto w-full pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#111827] transition-colors py-1 px-3 rounded-lg border border-[#E5E7EB] bg-white shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Website Publik</span>
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FAEDEF] border border-[#891523]/30 flex items-center justify-center text-[#891523] mx-auto">
              <Lock size={24} weight="bold" />
            </div>
            <h1 className="text-xl font-bold text-[#111827]">
              Login Internal Panitia
            </h1>
            <p className="text-xs text-[#6B7280]">
              Khusus Admin Panitia & Petugas Check-in MEMORIA 2026.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <WarningCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                EMAIL PANITIA
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@memoria.telkom.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523] focus:ring-1 focus:ring-[#891523]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523] focus:ring-1 focus:ring-[#891523]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#891523] hover:bg-[#720e1a] text-white font-semibold text-xs tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
            <span className="text-[11px] font-semibold text-[#6B7280] block text-center uppercase tracking-wider">
              Pilihan Akun Demo Cepat:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN')}
                className="py-2 px-2.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FAEDEF] hover:border-[#891523]/40 text-left transition-colors flex items-center gap-2"
              >
                <UserCircleGear size={20} className="text-[#891523] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-[#111827]">Admin Panitia</div>
                  <div className="text-[9px] text-[#6B7280]">admin@memoria...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('PETUGAS')}
                className="py-2 px-2.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FAEDEF] hover:border-[#891523]/40 text-left transition-colors flex items-center gap-2"
              >
                <QrCode size={20} className="text-[#891523] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-[#111827]">Petugas Check-in</div>
                  <div className="text-[9px] text-[#6B7280]">petugas@memoria...</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#9CA3AF] py-2">
        Sistem Manajemen Internal MEMORIA SIKC 2026.
      </div>
    </div>
  );
}
