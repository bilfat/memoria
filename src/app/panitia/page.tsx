'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { getDashboardMetricsAction, DashboardMetrics } from '@/app/actions/dashboard';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  CheckCircle,
  Ticket,
  EnvelopeSimple,
  QrCode,
  ArrowRight,
  ArrowsClockwise,
  CheckSquareOffset,
} from '@phosphor-icons/react';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardMetrics>({
    totalActiveParticipants: 0,
    presentParticipants: 0,
    uncheckinParticipants: 0,
    publishedTickets: 0,
    totalQuota: 0,
    usedQuota: 0,
    hasUnlimitedTickets: false,
    totalLecturers: 0,
    presentLecturers: 0,
    totalVenueCheckins: 0,
    recentCheckins: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { error: toastError } = useToast();

  const loadMetrics = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getDashboardMetricsAction();
      if (res.success && res.metrics) {
        setStats(res.metrics);
        setErrorMessage(null);
      } else if (!silent) {
        setErrorMessage(res.error || 'Gagal memuat metrik dari database.');
        toastError('Gagal Memuat Metrik', res.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
        toastError('Kesalahan Sistem', err.message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadMetrics();

    // Supabase Realtime: sinkronisasi otomatis metrik saat ada data masuk / check-in
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadMetrics(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          loadMetrics(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadMetrics(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lecturers' },
        () => {
          loadMetrics(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMetrics]);

  return (
    <AdminShell title="Dashboard Ringkasan Acara" adminOnly={true}>
      <div className="space-y-6">
        {/* Top greeting banner */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              Selamat Datang di Panel MEMORIA
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Pantau seluruh aktivitas pendaftaran tiket, kapasitas kuota, presensi meja registrasi, dan publikasi website resmi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/panitia/check-in"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#891523] text-white text-xs font-semibold shadow-xs hover:bg-[#720e1a] transition-colors"
            >
              <QrCode size={16} />
              <span>Buka Check-in</span>
            </Link>
            <button
              onClick={() => loadMetrics()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-[#4B5563] text-xs font-medium hover:bg-[#F9FAFB] transition-colors cursor-pointer disabled:opacity-50"
              title="Perbarui data metrik"
            >
              <ArrowsClockwise size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Perbarui</span>
            </button>
          </div>
        </div>

        {/* Error Notification Banner if query fails */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-4">
            <div>
              <span className="font-bold block">Gagal menyinkronkan data dengan Supabase:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadMetrics()}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-semibold hover:bg-rose-800 shrink-0 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Primary Metric KPI Grid (Live from DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Peserta Mahasiswa */}
          <Link
            href="/panitia/peserta"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Peserta Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAEDEF] text-[#891523] flex items-center justify-center">
                <Users size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.totalActiveParticipants}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">{stats.presentParticipants} Hadir</span>
                <span>•</span>
                <span>{stats.uncheckinParticipants} Belum Presensi</span>
              </div>
            </div>
          </Link>

          {/* 2. Kapasitas & Kuota Tiket */}
          <Link
            href="/panitia/tiket"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Tiket Published
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Ticket size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.publishedTickets} Kategori
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                {stats.usedQuota} terpakai {stats.totalQuota > 0 ? `dari ${stats.totalQuota} kuota` : '(kuota fleksibel)'}
              </div>
            </div>
          </Link>

          {/* 3. Total Presensi di Venue */}
          <Link
            href="/panitia/check-in"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Total Hadir di Lokasi
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.totalVenueCheckins} Orang
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                {stats.presentParticipants} Mahasiswa • {stats.presentLecturers} Dosen VIP
              </div>
            </div>
          </Link>

          {/* 4. Undangan Dosen */}
          <Link
            href="/panitia/undangan/dosen"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Undangan Dosen
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <EnvelopeSimple size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.totalLecturers} Dosen
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                <span className="text-emerald-600 font-semibold">{stats.presentLecturers} Hadir</span> di lokasi
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Shortcuts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Module Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              Aksi Cepat Operasional
            </h3>
            <div className="space-y-2">
              <Link
                href="/panitia/check-in"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Scanner Check-in</div>
                    <div className="text-[10px] text-[#6B7280]">Pemindaian QR tiket dan presensi manual</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>

              <Link
                href="/panitia/peserta"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Kelola Data Peserta</div>
                    <div className="text-[10px] text-[#6B7280]">Edit 2-tahap, arsip, dan ekspor .xlsx</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>

              <Link
                href="/panitia/website/beranda"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Ticket size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Kelola Konten Website</div>
                    <div className="text-[10px] text-[#6B7280]">Perbarui tanggal, venue, band & teasers</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>
            </div>
          </div>

          {/* Recent Check-in Activity Feed */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                Riwayat Check-in Terkini
              </h3>
              <Link
                href="/panitia/check-in"
                className="text-xs font-semibold text-[#891523] hover:underline"
              >
                Buka Seluruh Riwayat →
              </Link>
            </div>

            {stats.recentCheckins.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {stats.recentCheckins.map((chk) => (
                  <div key={chk.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={18} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] truncate">
                          {chk.subjectName}
                        </div>
                        <div className="text-[11px] text-[#6B7280] font-mono truncate">
                          {chk.subjectType === 'MAHASISWA' ? `NIM: ${chk.subjectIdentifier}` : `Kode: ${chk.subjectIdentifier}`} • Metode {chk.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-medium text-[#111827]">
                        {formatWibDateTime(chk.checkedInAt)}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">Oleh {chk.operatorName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#9CA3AF]">
                Belum ada tamu yang check-in di venue.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
