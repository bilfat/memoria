'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { useToast } from '@/components/ui/Toast';
import { formatWibDateTime } from '@/lib/date';
import { CameraQrScanner } from '@/components/panitia/check-in/CameraQrScanner';
import { getCheckinHistoryAction, CheckinHistoryItem, CheckinStats } from '@/app/actions/checkins';
import { createClient } from '@/lib/supabase/client';
import {
  QrCode,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  WarningCircle,
  Warning,
  ArrowsClockwise,
  GraduationCap,
  IdentificationBadge,
  Sparkle,
  X,
} from '@phosphor-icons/react';

interface ResolvedAttendee {
  targetType: 'PARTICIPANT' | 'LECTURER';
  id: string;
  name: string;
  identifier: string;
  identifierMasked: string;
  subtext: string;
  ticketName: string;
  isCheckedIn: boolean;
  firstCheckedInAt: string | null;
  operatorName: string;
  checkinMethod?: string | null;
  canCheckIn: boolean;
}

interface SuccessModalData {
  name: string;
  ticketName: string;
  checkedAt: string;
  operatorName: string;
  targetType: 'PARTICIPANT' | 'LECTURER';
}

interface AlreadyCheckedModalData {
  name: string;
  ticketName: string;
  checkedAt: string;
  operatorName: string;
  targetType: 'PARTICIPANT' | 'LECTURER';
}

export default function CheckinPage() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<'SCAN' | 'MANUAL' | 'HISTORY'>('SCAN');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // History & KPI Stats State
  const [records, setRecords] = useState<CheckinHistoryItem[]>([]);
  const [stats, setStats] = useState<CheckinStats>({ totalCount: 0, studentCount: 0, lecturerCount: 0 });
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'MAHASISWA' | 'DOSEN'>('ALL');
  const [historySearch, setHistorySearch] = useState('');

  // Scan QR State
  const [scanResult, setScanResult] = useState<{
    attendee: ResolvedAttendee;
    resolutionToken: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Manual Search State
  const [manualType, setManualType] = useState<'MAHASISWA' | 'DOSEN' | 'TOKEN'>('MAHASISWA');
  const [manualQuery, setManualQuery] = useState('');
  const [manualResult, setManualResult] = useState<{
    attendee: ResolvedAttendee;
    resolutionToken: string;
  } | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  // Success Confirmation Popup State
  const [successModal, setSuccessModal] = useState<SuccessModalData | null>(null);
  // Duplicate / Already Checked Confirmation Popup State
  const [alreadyCheckedModal, setAlreadyCheckedModal] = useState<AlreadyCheckedModalData | null>(null);

  // Load live history & stats from Supabase
  const loadHistoryData = useCallback(async () => {
    try {
      const res = await getCheckinHistoryAction();
      if (res.success) {
        setRecords(res.records);
        setStats(res.stats);
      } else if (res.error) {
        toastError('Gagal Memuat Riwayat', res.error);
      }
    } catch (err: any) {
      toastError('Gagal Memuat Riwayat', err.message);
    }
  }, [toastError]);

  useEffect(() => {
    loadHistoryData();

    // Supabase Realtime: sinkronisasi live KPI dan riwayat scan check-in
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:checkin-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          loadHistoryData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadHistoryData]);

  // 1. Resolve QR token from Camera / Direct Scan (Atomic 1-Step Instant Check-in)
  const handleLookupQr = async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;

    setScanError(null);
    setScanResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/checkins/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: trimmed, autoConfirm: true, method: 'CAMERA_QR' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setScanError(data.message || 'QR Code tidak terdaftar pada sistem.');
        return;
      }

      // Kasus 1: Sudah pernah check-in sebelumnya -> Tampilkan popup peringatan langsung
      if (data.outcome === 'ALREADY_CHECKED_IN' || data.attendee?.isCheckedIn) {
        setAlreadyCheckedModal({
          name: data.attendee.name,
          ticketName: data.attendee.ticketName,
          checkedAt: data.attendee.firstCheckedInAt || data.attendee.checkedAt || new Date().toISOString(),
          operatorName: data.attendee.operatorName || 'Panitia MEMORIA',
          targetType: data.attendee.targetType,
        });
        setScanResult(null);
        return;
      }

      // Kasus 2: Berhasil check-in baru secara instan dalam 1 roundtrip
      if (data.outcome === 'CREATED') {
        setSuccessModal({
          name: data.attendee.name,
          ticketName: data.attendee.ticketName,
          checkedAt: data.attendee.checkedAt || new Date().toISOString(),
          operatorName: data.attendee.operatorName || 'Petugas Check-in',
          targetType: data.attendee.targetType,
        });
        setScanResult(null);
        // Refresh live counter & riwayat di background secara non-blocking
        loadHistoryData().catch(console.error);
        return;
      }

      // Fallback 2-step jika autoConfirm tidak aktif
      if (data.resolutionToken) {
        await handleConfirmCheckin(data.resolutionToken, 'CAMERA_QR', data.attendee);
      }
    } catch (err: any) {
      setScanError(err.message || 'Gagal memproses QR Code.');
      setTimeout(() => setScanError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 2. Resolve Manual Input
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualQuery.trim();
    if (!q) return;

    setManualError(null);
    setManualResult(null);
    setLoading(true);

    try {
      const payload: any = { manualType, manualQuery: q };
      if (manualType === 'TOKEN') {
        payload.qrToken = q;
      }

      const res = await fetch('/api/checkins/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setManualError(data.message || 'Data tidak ditemukan.');
        return;
      }

      setManualResult({
        attendee: data.attendee,
        resolutionToken: data.resolutionToken,
      });
    } catch (err: any) {
      setManualError(err.message || 'Gagal mencari data.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Confirm Check-in (Execute atomic RPC)
  const handleConfirmCheckin = async (
    resolutionToken: string,
    method: 'CAMERA_QR' | 'MANUAL',
    attendee: ResolvedAttendee
  ) => {
    if (!resolutionToken) {
      toastError('Kesalahan', 'Token resolusi tidak ditemukan.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/checkins/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionToken, method }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toastError('Presensi Ditolak', data.message || 'Gagal mencatat presensi.');
        return;
      }

      if (data.outcome === 'ALREADY_CHECKED_IN') {
        // Tampilkan Popup Modal Peringatan di Tengah Layar (Laptop & HP)
        setAlreadyCheckedModal({
          name: data.name || attendee.name,
          ticketName: data.ticketName || attendee.ticketName,
          checkedAt: data.checkedAt || attendee.firstCheckedInAt || new Date().toISOString(),
          operatorName: data.operatorName || attendee.operatorName || 'Panitia MEMORIA',
          targetType: attendee.targetType,
        });

        setScanResult(null);
        setManualResult(null);
      } else if (data.outcome === 'CREATED') {
        // Tampilkan Popup Sukses Resmi
        setSuccessModal({
          name: data.name,
          ticketName: data.ticketName || attendee.ticketName,
          checkedAt: data.checkedAt,
          operatorName: data.operatorName || 'Petugas Check-in',
          targetType: attendee.targetType,
        });

        // Clear active resolved result card
        setScanResult(null);
        setManualResult(null);
        setManualQuery('');
      }

      // Refresh data riwayat presensi & counter KPI di background tanpa memblokir rendering popup
      loadHistoryData().catch(console.error);
    } catch (err: any) {
      toastError('Gagal Check-In', err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Close success modal & ready for next scan
  const handleCloseSuccessModal = () => {
    setSuccessModal(null);
  };

  // Otomatis menutup popup modal sukses setelah 2.5 detik tanpa perlu klik tombol
  useEffect(() => {
    if (!successModal) return;
    const timer = setTimeout(() => {
      setSuccessModal(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [successModal]);

  // Otomatis menutup popup modal sudah check-in setelah 3.5 detik tanpa perlu klik tombol
  useEffect(() => {
    if (!alreadyCheckedModal) return;
    const timer = setTimeout(() => {
      setAlreadyCheckedModal(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [alreadyCheckedModal]);

  // Filter history list
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (historyFilter !== 'ALL' && r.subjectType !== historyFilter) return false;
      if (!historySearch.trim()) return true;

      const q = historySearch.toLowerCase().trim();
      return (
        r.subjectName.toLowerCase().includes(q) ||
        r.subjectIdentifier.toLowerCase().includes(q) ||
        r.operatorName.toLowerCase().includes(q)
      );
    });
  }, [records, historyFilter, historySearch]);

  return (
    <AdminShell title="Meja Registrasi & Check-in Presensi">
      <div className="space-y-6 w-full max-w-full min-w-0">
        {/* KPI Counter Header (Live from DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs min-w-0">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
              Total Hadir di Venue
            </span>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.totalCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">Seluruh kategori kehadiran</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs min-w-0">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
              Mahasiswa Hadir
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.studentCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">Peserta tiket reguler / VIP</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs min-w-0">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
              Dosen & Tamu Kehormatan
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.lecturerCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">Undangan khusus dosen</p>
          </div>
        </div>

        {/* Tab Navigation - Overflow-x-auto & shrink-0 strictly prevent page horizontal scroll */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-neutral-200 overflow-x-auto scrollbar-none pb-px w-full max-w-full">
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'SCAN'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <QrCode size={16} />
            Scan QR Kamera
          </button>

          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'MANUAL'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MagnifyingGlass size={16} />
            Pencarian Manual
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Clock size={16} />
            Riwayat Check-in ({stats.totalCount})
          </button>
        </div>

        {/* TAB 1: SCAN QR KAMERA */}
        {activeTab === 'SCAN' && (
          <div className="max-w-2xl mx-auto space-y-4 w-full min-w-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 space-y-4 shadow-sm text-center w-full min-w-0">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 inline-flex items-center gap-2">
                  <QrCode size={18} className="text-emerald-600" />
                  Pemindai Kamera QR Code Tiket / Undangan
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Arahkan kamera ke QR Code e-ticket Mahasiswa atau lembar undangan Dosen.
                  Sistem otomatis memverifikasi identitas, status tiket aktif, dan mencegah presensi ganda.
                </p>
              </div>

              {/* Real-Time Camera Scanner with HTTPS getUserMedia */}
              <CameraQrScanner
                onScan={(token) => handleLookupQr(token)}
                isProcessing={loading || actionLoading || !!successModal || !!alreadyCheckedModal}
              />

              {scanError && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center justify-center gap-2">
                  <WarningCircle size={18} className="shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PENCARIAN MANUAL */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-6 w-full min-w-0">
            <div className="max-w-2xl bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 space-y-4 shadow-sm w-full min-w-0">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Pencarian & Presensi Manual</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Gunakan form ini untuk mencatat presensi jika kamera scanner tidak dapat membaca fisik QR Code.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="manualType"
                    value="MAHASISWA"
                    checked={manualType === 'MAHASISWA'}
                    onChange={() => {
                      setManualType('MAHASISWA');
                      setManualResult(null);
                      setManualError(null);
                    }}
                    className="accent-neutral-900"
                  />
                  <span>Mahasiswa (Cari NIM)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="manualType"
                    value="DOSEN"
                    checked={manualType === 'DOSEN'}
                    onChange={() => {
                      setManualType('DOSEN');
                      setManualResult(null);
                      setManualError(null);
                    }}
                    className="accent-neutral-900"
                  />
                  <span>Dosen (Cari Email / Kode)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="manualType"
                    value="TOKEN"
                    checked={manualType === 'TOKEN'}
                    onChange={() => {
                      setManualType('TOKEN');
                      setManualResult(null);
                      setManualError(null);
                    }}
                    className="accent-neutral-900"
                  />
                  <span>Token QR Manual</span>
                </label>
              </div>

              <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder={
                    manualType === 'MAHASISWA'
                      ? 'Masukkan NIM Mahasiswa resmi...'
                      : manualType === 'DOSEN'
                      ? 'Masukkan Email atau Kode Dosen...'
                      : 'Masukkan token QR tiket...'
                  }
                  className="flex-1 min-w-0 px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={loading || !manualQuery.trim()}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {loading ? 'Mencari...' : 'Cari Data'}
                </button>
              </form>

              {manualError && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <WarningCircle size={18} className="shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {/* Manual Result Card */}
              {manualResult && (
                <div className="mt-4 p-5 rounded-xl border border-neutral-300 bg-neutral-50/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="text-xs font-bold text-neutral-800">
                      Data Terverifikasi ({manualResult.attendee.targetType === 'PARTICIPANT' ? 'MAHASISWA' : 'DOSEN VIP'})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        manualResult.attendee.isCheckedIn
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {manualResult.attendee.isCheckedIn ? 'Sudah Hadir' : 'Belum Hadir'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-neutral-900">
                      {manualResult.attendee.name}
                    </div>
                    <div className="text-xs font-mono text-neutral-600">
                      {manualResult.attendee.targetType === 'PARTICIPANT'
                        ? `NIM: ${manualResult.attendee.identifierMasked}`
                        : `Kode: ${manualResult.attendee.identifier}`}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {manualResult.attendee.subtext}
                    </div>
                  </div>

                  {manualResult.attendee.isCheckedIn ? (
                    <div className="space-y-2">
                      <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        Telah check-in pada{' '}
                        <strong>{formatWibDateTime(manualResult.attendee.firstCheckedInAt || '')}</strong>{' '}
                        oleh operator {manualResult.attendee.operatorName}.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setManualResult(null);
                          setManualQuery('');
                        }}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Cari Tamu Lain
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleConfirmCheckin(
                            manualResult.resolutionToken,
                            'MANUAL',
                            manualResult.attendee
                          )
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle size={15} weight="bold" />
                        {actionLoading ? 'Mencatat Kehadiran...' : 'Hadirkan Peserta Secara Manual'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualResult(null);
                          setManualQuery('');
                        }}
                        className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT CHECK-IN */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm space-y-4 p-4 w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full min-w-0">
              <div className="relative w-full sm:w-80 min-w-0">
                <MagnifyingGlass
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari nama atau NIM..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                <button
                  type="button"
                  onClick={loadHistoryData}
                  className="p-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 cursor-pointer shrink-0"
                  title="Perbarui data"
                >
                  <ArrowsClockwise size={15} />
                </button>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer flex-1 sm:flex-initial"
                >
                  <option value="ALL">Semua Kategori ({records.length})</option>
                  <option value="MAHASISWA">Mahasiswa ({stats.studentCount})</option>
                  <option value="DOSEN">Dosen ({stats.lecturerCount})</option>
                </select>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Belum ada data check-in yang sesuai filter.
              </div>
            ) : (
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Waktu Presensi (WIB)</th>
                      <th className="px-4 py-3 font-semibold">Tipe</th>
                      <th className="px-4 py-3 font-semibold">Nama Tamu</th>
                      <th className="px-4 py-3 font-semibold">Identitas</th>
                      <th className="px-4 py-3 font-semibold">Kategori Akses</th>
                      <th className="px-4 py-3 font-semibold">Metode</th>
                      <th className="px-4 py-3 font-semibold">Operator Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/70">
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {formatWibDateTime(r.checkedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.subjectType === 'MAHASISWA'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {r.subjectType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-neutral-900">
                          {r.subjectName || '-'}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-600">
                          {r.subjectIdentifier || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{r.ticketName || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              r.method.includes('QR')
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {r.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {r.operatorName || 'Petugas Check-in'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* POPUP CENTANG HIJAU KEBERHASILAN CHECK-IN (MODAL) */}
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-neutral-200 space-y-4 relative animate-scaleUp">
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>

              {/* Ultra-Smooth Animated SVG Checkmark Icon */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                {/* Glowing Pulse Halo */}
                <div
                  className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                  style={{ animationDuration: '1.8s' }}
                />
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-emerald-100 via-emerald-50 to-teal-50 border border-emerald-200/60 shadow-inner" />

                {/* Smooth Animated SVG Drawing Checkmark */}
                <svg
                  className="relative w-14 h-14 text-emerald-600 drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
                  viewBox="0 0 52 52"
                  fill="none"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    className="checkmark-circle-anim"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 27.5L22.5 35L37.5 18"
                    className="checkmark-check-anim"
                    stroke="#059669"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
                  Presensi Berhasil Diverifikasi
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 mt-1">
                  {successModal.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {successModal.ticketName}
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Waktu Presensi:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatWibDateTime(successModal.checkedAt)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Petugas Verifikator:</span>
                  <span className="font-semibold text-neutral-900">
                    {successModal.operatorName}
                  </span>
                </div>
              </div>

              {/* Countdown Progress Bar (Auto-dismiss in 2.5s) */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full w-full"
                    style={{
                      animation: 'shrinkProgress 2.5s linear forwards',
                    }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">
                  Menutup otomatis dalam 2.5 detik untuk scan berikutnya...
                </p>
              </div>

              <style jsx>{`
                @keyframes shrinkProgress {
                  from {
                    width: 100%;
                  }
                  to {
                    width: 0%;
                  }
                }

                @keyframes checkCircleDraw {
                  0% {
                    stroke-dashoffset: 150;
                    stroke-dasharray: 150;
                    transform: rotate(-90deg);
                    transform-origin: 26px 26px;
                  }
                  100% {
                    stroke-dashoffset: 0;
                    stroke-dasharray: 150;
                    transform: rotate(0deg);
                    transform-origin: 26px 26px;
                  }
                }

                @keyframes checkMarkDraw {
                  0% {
                    stroke-dashoffset: 45;
                    stroke-dasharray: 45;
                    opacity: 0;
                  }
                  40% {
                    opacity: 1;
                  }
                  100% {
                    stroke-dashoffset: 0;
                    stroke-dasharray: 45;
                    opacity: 1;
                  }
                }

                :global(.checkmark-circle-anim) {
                  stroke-dasharray: 150;
                  stroke-dashoffset: 150;
                  animation: checkCircleDraw 0.55s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }

                :global(.checkmark-check-anim) {
                  stroke-dasharray: 45;
                  stroke-dashoffset: 45;
                  animation: checkMarkDraw 0.4s 0.35s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
              `}</style>

              <button
                type="button"
                autoFocus
                onClick={handleCloseSuccessModal}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-98"
              >
                Scan Tamu Berikutnya (Tutup Cepat)
              </button>
            </div>
          </div>
        )}
        {/* POPUP SUDAH CHECK-IN SEBELUMNYA (MODAL POPUP DI TENGAH LAYAR) */}
        {alreadyCheckedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-amber-300 space-y-4 relative animate-scaleUp">
              <button
                type="button"
                onClick={() => setAlreadyCheckedModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>

              {/* Glowing Amber Pulse Halo & Icon */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-amber-100 via-amber-50 to-orange-50 border border-amber-300 shadow-inner" />
                <Warning
                  size={36}
                  weight="fill"
                  className="relative text-amber-600 drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  Sudah Check-In Sebelumnya
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 mt-2">
                  {alreadyCheckedModal.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {alreadyCheckedModal.ticketName}
                </p>
              </div>

              <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-amber-900">
                  <span className="text-neutral-600">Waktu Presensi Awal:</span>
                  <span className="font-bold">
                    {formatWibDateTime(alreadyCheckedModal.checkedAt)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-900">
                  <span className="text-neutral-600">Petugas / Operator:</span>
                  <span className="font-bold">
                    {alreadyCheckedModal.operatorName}
                  </span>
                </div>
                <div className="text-[11px] text-amber-700 pt-1.5 border-t border-amber-200/60 text-center font-medium">
                  Tamu ini telah tercatat hadir. Presensi ganda dicegah oleh sistem.
                </div>
              </div>

              {/* Countdown Progress Bar (Auto-dismiss in 3.5s) */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full w-full"
                    style={{
                      animation: 'shrinkProgress 3.5s linear forwards',
                    }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">
                  Menutup otomatis dalam 3.5 detik untuk scan berikutnya...
                </p>
              </div>

              <button
                type="button"
                autoFocus
                onClick={() => setAlreadyCheckedModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-98"
              >
                Tutup & Siap Scan Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
