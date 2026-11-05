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

  // 1. Resolve QR token from Camera / Direct Scan
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
        body: JSON.stringify({ qrToken: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setScanError(data.message || 'QR Code tidak terdaftar pada sistem.');
        return;
      }

      setScanResult({
        attendee: data.attendee,
        resolutionToken: data.resolutionToken,
      });
    } catch (err: any) {
      setScanError(err.message || 'Gagal memproses QR Code.');
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
        info(
          'Sudah Check-In Sebelumnya',
          `${data.name} telah tercatat hadir pada ${formatWibDateTime(data.checkedAt)}.`
        );

        // Update current preview card to reflect checked-in status
        const updatedAttendee: ResolvedAttendee = {
          ...attendee,
          isCheckedIn: true,
          firstCheckedInAt: data.checkedAt,
          canCheckIn: false,
        };
        if (method === 'CAMERA_QR' && scanResult) {
          setScanResult({ attendee: updatedAttendee, resolutionToken: '' });
        } else if (method === 'MANUAL' && manualResult) {
          setManualResult({ attendee: updatedAttendee, resolutionToken: '' });
        }
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

      // Refresh data riwayat presensi & counter KPI
      await loadHistoryData();
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
      <div className="space-y-6">
        {/* KPI Counter Header (Live from DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Total Hadir di Venue
            </span>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.totalCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Seluruh kategori kehadiran</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Mahasiswa Hadir
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.studentCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Peserta tiket reguler / VIP</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Dosen & Tamu Kehormatan
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.lecturerCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Undangan khusus dosen</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'SCAN'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <QrCode size={16} />
            Scan QR Code Kamera
          </button>

          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'MANUAL'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MagnifyingGlass size={16} />
            Pencarian Manual (NIM / Email / Kode)
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Live Camera Scanner */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
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
                    isProcessing={loading || actionLoading}
                  />

                  {scanError && (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                      <WarningCircle size={18} className="shrink-0" />
                      <span>{scanError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Verified Attendee Preview Card */}
              <div className="space-y-4">
                {scanResult ? (
                  <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                        Hasil Verifikasi QR
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          scanResult.attendee.targetType === 'PARTICIPANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {scanResult.attendee.targetType === 'PARTICIPANT' ? 'MAHASISWA' : 'DOSEN VIP'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-neutral-900">
                        {scanResult.attendee.name}
                      </h4>
                      <p className="text-xs font-mono text-neutral-600">
                        {scanResult.attendee.targetType === 'PARTICIPANT'
                          ? `NIM: ${scanResult.attendee.identifierMasked}`
                          : `Kode: ${scanResult.attendee.identifier}`}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {scanResult.attendee.subtext}
                      </p>
                      <div className="inline-block mt-1 px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                        {scanResult.attendee.ticketName}
                      </div>
                    </div>

                    {/* Attendance status badge */}
                    {scanResult.attendee.isCheckedIn ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          <CheckCircle size={16} weight="fill" className="text-amber-600" />
                          SUDAH CHECK-IN SEBELUMNYA
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Waktu: <strong>{formatWibDateTime(scanResult.attendee.firstCheckedInAt || '')}</strong>
                        </div>
                        <div className="text-[10px] text-amber-700">
                          Operator: {scanResult.attendee.operatorName}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Clock size={16} />
                          BELUM CHECK-IN
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Tiket / Undangan terverifikasi sah dan siap dihadirkan.
                        </p>
                      </div>
                    )}

                    <div>
                      {scanResult.attendee.isCheckedIn ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-lg bg-neutral-200 text-neutral-500 text-xs font-bold cursor-not-allowed"
                        >
                          Telah Hadir (Presensi Terkunci)
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleConfirmCheckin(
                              scanResult.resolutionToken,
                              'CAMERA_QR',
                              scanResult.attendee
                            )
                          }
                          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle size={16} weight="bold" />
                          {actionLoading ? 'Mencatat Kehadiran...' : 'Hadirkan Sekarang'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border border-dashed border-neutral-300 bg-white flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                    <QrCode size={36} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Belum ada QR yang dipindai</span>
                    <span className="text-[11px] text-neutral-400 mt-1">
                      Arahkan kamera ke tiket atau masukkan token untuk memverifikasi tamu.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENCARIAN MANUAL */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-6">
            <div className="max-w-2xl bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm">
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

              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder={
                    manualType === 'MAHASISWA'
                      ? 'Masukkan NIM Mahasiswa resmi...'
                      : manualType === 'DOSEN'
                      ? 'Masukkan Email atau Kode Dosen (contoh: DOS-26-0001)...'
                      : 'Masukkan token QR tiket...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={loading || !manualQuery.trim()}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
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
                    <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      Telah check-in pada{' '}
                      <strong>{formatWibDateTime(manualResult.attendee.firstCheckedInAt || '')}</strong>{' '}
                      oleh operator {manualResult.attendee.operatorName}.
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT CHECK-IN */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm space-y-4 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
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

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={loadHistoryData}
                  className="p-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  title="Perbarui data"
                >
                  <ArrowsClockwise size={15} />
                </button>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
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

              {/* Animated Green Checkmark Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle size={40} weight="fill" className="animate-bounce" />
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

              <button
                type="button"
                autoFocus
                onClick={handleCloseSuccessModal}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-98"
              >
                Scan Tamu Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
