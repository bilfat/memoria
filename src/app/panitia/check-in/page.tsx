'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { checkinAdapter, participantAdapter, invitationAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { CheckinRecord, Participant, LecturerInvitation } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import {
  QrCode,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  WarningCircle,
  User,
  GraduationCap,
  Sparkle,
  IdentificationBadge,
  ArrowsClockwise,
  Ticket,
} from '@phosphor-icons/react';

export default function CheckinPage() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<'SCAN' | 'MANUAL' | 'HISTORY'>('SCAN');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<CheckinRecord[]>([]);

  // Scan QR state
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    subjectType: 'MAHASISWA' | 'DOSEN';
    subject: any;
    existingCheckin?: CheckinRecord;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Manual search state
  const [manualType, setManualType] = useState<'MAHASISWA' | 'DOSEN'>('MAHASISWA');
  const [manualQuery, setManualQuery] = useState('');
  const [manualResult, setManualResult] = useState<{
    subjectType: 'MAHASISWA' | 'DOSEN';
    subject: any;
    existingCheckin?: CheckinRecord;
  } | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  // Quick Demo Samples for simulation
  const [quickSamples, setQuickSamples] = useState<{
    students: { name: string; nim: string; qrToken: string }[];
    lecturers: { name: string; code: string; qrToken: string }[];
  }>({ students: [], lecturers: [] });

  // History search / filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'MAHASISWA' | 'DOSEN'>('ALL');
  const [historySearch, setHistorySearch] = useState('');

  const loadData = async () => {
    try {
      const [recList, partList, lecList] = await Promise.all([
        checkinAdapter.listRecords(),
        participantAdapter.listParticipants('ACTIVE'),
        invitationAdapter.listLecturers(),
      ]);

      setRecords(recList);

      // Collect quick demo sample tokens
      const studentsWithQr = [];
      for (const p of partList.slice(0, 5)) {
        const ti = await participantAdapter.getTicketIdentity(p.id);
        if (ti) {
          studentsWithQr.push({ name: p.fullName, nim: p.nim, qrToken: ti.checkinQrToken });
        }
      }

      setQuickSamples({
        students: studentsWithQr,
        lecturers: lecList.map((l) => ({ name: l.name, code: l.inviteCode, qrToken: l.checkinQrToken })),
      });
    } catch (err: any) {
      toastError('Gagal Memuat Data', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle QR code lookup
  const handleLookupQr = async (tokenToLookup?: string) => {
    const token = (tokenToLookup || qrInput).trim();
    if (!token) return;

    setScanError(null);
    setScanResult(null);
    setLoading(true);

    try {
      const res = await checkinAdapter.lookupByQr(token);
      setScanResult(res);
      if (tokenToLookup) setQrInput(tokenToLookup);
    } catch (err: any) {
      setScanError(err.message || 'QR Code tidak terdaftar pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual lookup
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualQuery.trim();
    if (!q) return;

    setManualError(null);
    setManualResult(null);
    setLoading(true);

    try {
      if (manualType === 'MAHASISWA') {
        const res = await checkinAdapter.lookupManualStudent(q);
        setManualResult({
          subjectType: 'MAHASISWA',
          subject: res.participant,
          existingCheckin: res.existingCheckin,
        });
      } else {
        const res = await checkinAdapter.lookupManualLecturer(q);
        setManualResult({
          subjectType: 'DOSEN',
          subject: res.lecturer,
          existingCheckin: res.existingCheckin,
        });
      }
    } catch (err: any) {
      setManualError(err.message || 'Data tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  // Perform Check-in action
  const handleExecuteCheckin = async (
    subjectType: 'MAHASISWA' | 'DOSEN',
    subjectId: string,
    method: 'QR' | 'MANUAL'
  ) => {
    try {
      const res = await checkinAdapter.checkInSubject({
        subjectType,
        subjectId,
        method,
      });

      if (res.alreadyCheckedIn) {
        info('Sudah Check-In', 'Peserta ini sebelumnya telah tercatat hadir.');
      } else {
        success('Check-in Berhasil!', `Kehadiran ${res.record.subjectName} berhasil dicatat.`);
      }

      await loadData();

      // Refresh current result card
      if (method === 'QR' && scanResult) {
        setScanResult({
          ...scanResult,
          existingCheckin: res.record,
        });
      } else if (method === 'MANUAL' && manualResult) {
        setManualResult({
          ...manualResult,
          existingCheckin: res.record,
        });
      }
    } catch (err: any) {
      toastError('Gagal Check-In', err.message);
    }
  };

  // Filter history
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (historyFilter !== 'ALL' && r.subjectType !== historyFilter) return false;
      if (!historySearch.trim()) return true;

      const q = historySearch.toLowerCase().trim();
      return (
        (r.subjectName && r.subjectName.toLowerCase().includes(q)) ||
        (r.subjectIdentifier && r.subjectIdentifier.toLowerCase().includes(q)) ||
        (r.operatorName && r.operatorName.toLowerCase().includes(q))
      );
    });
  }, [records, historyFilter, historySearch]);

  const studentCount = records.filter((r) => r.subjectType === 'MAHASISWA').length;
  const lecturerCount = records.filter((r) => r.subjectType === 'DOSEN').length;

  return (
    <AdminShell title="Meja Registrasi & Check-in Presensi">
      <div className="space-y-6">
        {/* KPI Counter Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Total Hadir di Venue
            </span>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{records.length}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Seluruh kategori kehadiran</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Mahasiswa Hadir
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{studentCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Peserta tiket reguler / VIP</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Dosen & Tamu Kehormatan
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{lecturerCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Undangan khusus dosen</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'SCAN'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <QrCode size={16} />
            Scan QR Code
          </button>

          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'MANUAL'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MagnifyingGlass size={16} />
            Pencarian Manual (NIM / Email)
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'HISTORY'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Clock size={16} />
            Riwayat Check-in ({records.length})
          </button>
        </div>

        {/* TAB 1: SCAN QR */}
        {activeTab === 'SCAN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Scanner & Input */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <QrCode size={18} />
                      Pemindai QR Code Tiket / Undangan
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Arahkan barcode scanner fisik atau masukkan token QR di bawah. Sistem secara otomatis
                      mendeteksi identitas Mahasiswa atau Dosen tanpa perlu memilih kategori manual.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLookupQr();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Tempel / Scan token QR tiket di sini (e.g. qr-part-... atau qr-dsn-...)"
                      className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <button
                      type="submit"
                      disabled={loading || !qrInput.trim()}
                      className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {loading ? 'Memeriksa...' : 'Cari Data'}
                    </button>
                  </form>

                  {/* Quick Click Samples for Demo & Testing */}
                  <div className="p-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Simulasi Scan Cepat (Data Demo Siap Uji):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickSamples.students.map((s) => (
                        <button
                          key={s.nim}
                          type="button"
                          onClick={() => handleLookupQr(s.qrToken)}
                          className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5"
                        >
                          <GraduationCap size={13} className="text-emerald-600" />
                          <span>{s.name} ({s.nim})</span>
                        </button>
                      ))}
                      {quickSamples.lecturers.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleLookupQr(l.qrToken)}
                          className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5"
                        >
                          <IdentificationBadge size={13} className="text-amber-600" />
                          <span>{l.name} ({l.code})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {scanError && (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                      <WarningCircle size={18} className="shrink-0" />
                      <span>{scanError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Subject Card / Verification */}
              <div className="space-y-4">
                {scanResult ? (
                  <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                        Hasil Pemindaian QR
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          scanResult.subjectType === 'MAHASISWA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {scanResult.subjectType}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-neutral-900">
                        {scanResult.subjectType === 'MAHASISWA'
                          ? scanResult.subject.fullName
                          : scanResult.subject.name}
                      </h4>
                      <p className="text-xs font-mono text-neutral-600">
                        {scanResult.subjectType === 'MAHASISWA'
                          ? `NIM: ${scanResult.subject.nim}`
                          : `Kode Undangan: ${scanResult.subject.inviteCode}`}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {scanResult.subjectType === 'MAHASISWA'
                          ? `D4 Sistem Informasi Kota Cerdas — FIT`
                          : scanResult.subject.email}
                      </p>
                    </div>

                    {/* Attendance status */}
                    {scanResult.existingCheckin ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          <CheckCircle size={16} weight="fill" className="text-amber-600" />
                          SUDAH CHECK-IN SEBELUMNYA
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Waktu:{' '}
                          <strong>
                            {formatWibDateTime(scanResult.existingCheckin.checkedInAt)}
                          </strong>
                        </div>
                        <div className="text-[10px] text-amber-700">
                          Petugas:{' '}
                          {scanResult.existingCheckin.operatorName || 'Petugas Check-in'} (Metode:{' '}
                          {scanResult.existingCheckin.method})
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Clock size={16} />
                          BELUM CHECK-IN
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Tiket / Undangan valid dan siap dihadirkan ke acara.
                        </p>
                      </div>
                    )}

                    <div>
                      {scanResult.existingCheckin ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-lg bg-neutral-200 text-neutral-500 text-xs font-bold cursor-not-allowed"
                        >
                          Telah Hadir (Immutable)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleExecuteCheckin(
                              scanResult.subjectType,
                              scanResult.subject.id,
                              'QR'
                            )
                          }
                          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} weight="bold" />
                          Hadirkan Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border border-dashed border-neutral-300 bg-white flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                    <QrCode size={36} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Belum ada QR yang dipindai</span>
                    <span className="text-[11px] text-neutral-400 mt-1">
                      Hasil verifikasi data tamu akan muncul di sini.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL SEARCH */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-6">
            <div className="max-w-2xl bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Pencarian Presensi Manual</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Digunakan jika perangkat tamu bermasalah atau barcode tiket tidak dapat dipindai.
                </p>
              </div>

              <div className="flex items-center gap-4">
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
                  <span>Mahasiswa (Cari berdasarkan NIM)</span>
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
                  <span>Dosen (Cari Email / Kode Undangan)</span>
                </label>
              </div>

              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder={
                    manualType === 'MAHASISWA'
                      ? 'Masukkan NIM Mahasiswa (contoh: 7708230001)'
                      : 'Masukkan Email atau Kode Dosen (contoh: DSN-001)'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={loading || !manualQuery.trim()}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loading ? 'Mencari...' : 'Cari'}
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
                      Data Ditemukan ({manualResult.subjectType})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        manualResult.existingCheckin
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {manualResult.existingCheckin ? 'Sudah Hadir' : 'Belum Hadir'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-neutral-900">
                      {manualResult.subjectType === 'MAHASISWA'
                        ? manualResult.subject.fullName
                        : manualResult.subject.name}
                    </div>
                    <div className="text-xs font-mono text-neutral-600">
                      {manualResult.subjectType === 'MAHASISWA'
                        ? `NIM: ${manualResult.subject.nim}`
                        : `Kode: ${manualResult.subject.inviteCode} | ${manualResult.subject.email}`}
                    </div>
                  </div>

                  {manualResult.existingCheckin ? (
                    <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      Telah check-in pada{' '}
                      <strong>{formatWibDateTime(manualResult.existingCheckin.checkedInAt)}</strong>{' '}
                      oleh operator {manualResult.existingCheckin.operatorName || 'Petugas'}.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleExecuteCheckin(
                          manualResult.subjectType,
                          manualResult.subject.id,
                          'MANUAL'
                        )
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      <CheckCircle size={15} weight="bold" />
                      Hadirkan Peserta Secara Manual
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
                  onClick={loadData}
                  className="p-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  title="Perbarui data"
                >
                  <ArrowsClockwise size={15} />
                </button>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="ALL">Semua Kategori ({records.length})</option>
                  <option value="MAHASISWA">Mahasiswa ({studentCount})</option>
                  <option value="DOSEN">Dosen ({lecturerCount})</option>
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
                          {formatWibDateTime(r.checkedInAt)}
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
                              r.method === 'QR'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {r.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {r.operatorName || 'Admin Panitia'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
