'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { invitationAdapter, checkinAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { LecturerInvitation, CheckinRecord } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import {
  Plus,
  MagnifyingGlass,
  Copy,
  WhatsappLogo,
  EnvelopeSimple,
  PencilSimple,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  Clock,
  ArrowSquareOut,
  X,
  FloppyDisk,
} from '@phosphor-icons/react';

export default function LecturerInvitationsPage() {
  const { success, error: toastError, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [lecturers, setLecturers] = useState<LecturerInvitation[]>([]);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAttendance, setFilterAttendance] = useState<'ALL' | 'HADIR' | 'BELUM'>('ALL');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [lecList, chkList] = await Promise.all([
        invitationAdapter.listLecturers(),
        checkinAdapter.listRecords(),
      ]);
      setLecturers(lecList);
      setCheckins(chkList);
    } catch (err: any) {
      toastError('Gagal Memuat Data', err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list
  const filteredLecturers = useMemo(() => {
    return lecturers.filter((lec) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        lec.name.toLowerCase().includes(q) ||
        lec.email.toLowerCase().includes(q) ||
        lec.inviteCode.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Attendance match
      const isCheckedIn = checkins.some(
        (c) => c.subjectType === 'DOSEN' && c.subjectId === lec.id
      );

      if (filterAttendance === 'HADIR') return isCheckedIn;
      if (filterAttendance === 'BELUM') return !isCheckedIn;
      return true;
    });
  }, [lecturers, checkins, searchQuery, filterAttendance]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (lec: LecturerInvitation) => {
    setEditingId(lec.id);
    setFormName(lec.name);
    setFormEmail(lec.email);
    setFormPhone(lec.phone);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      setFormError('Semua bidang wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await invitationAdapter.saveLecturer({
          id: editingId,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          active: true,
        });
        success('Dosen Diperbarui', `Data ${formName} berhasil diperbarui.`);
      } else {
        await invitationAdapter.saveLecturer({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          active: true,
        });
        success('Undangan Dibuat', `Undangan untuk ${formName} berhasil dibuat.`);
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data undangan dosen.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (lec: LecturerInvitation) => {
    try {
      const updated = await invitationAdapter.toggleActive(lec.id);
      success(
        'Status Berubah',
        `Undangan ${lec.name} kini ${updated.active ? 'Aktif' : 'Nonaktif'}.`
      );
      await loadData();
    } catch (err: any) {
      toastError('Gagal Mengubah Status', err.message);
    }
  };

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/undangan/${token}`;
    navigator.clipboard.writeText(url);
    success('Tautan Tersalin', 'Tautan undangan digital telah disalin ke clipboard.');
  };

  const handleSimulateEmail = (lec: LecturerInvitation) => {
    info(
      'Simulasi Email Terkirim',
      `[SIMULASI FRONTEND] Undangan digital telah dikirimkan ke email ${lec.email}. Dosen dapat membukanya melalui tautan unik.`
    );
  };

  const handleOpenWhatsApp = (lec: LecturerInvitation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/undangan/${lec.inviteToken}`;
    const cleanPhone = lec.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Yth. Bapak/Ibu ${lec.name},\n\nMerupakan suatu kehormatan bagi kami mengundang Bapak/Ibu hadir pada Malam Puncak Dies Natalis SIKC: MEMORIA 2026.\n\nUndangan digital dan QR Code akses kehormatan dapat diakses melalui tautan berikut:\n${inviteUrl}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const totalInvited = lecturers.length;
  const totalAttended = checkins.filter((c) => c.subjectType === 'DOSEN').length;

  return (
    <AdminShell title="Kelola Undangan Dosen & Tamu Kehormatan" adminOnly={true}>
      <div className="space-y-6">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              Total Dosen Diundang: <strong>{totalInvited}</strong> | Hadir: <strong>{totalAttended}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/panitia/undangan/template"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <FileText size={15} /> Edit Template Surat
            </Link>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Plus size={15} /> Tambah Undangan Dosen
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau kode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-neutral-500">Filter Kehadiran:</span>
            <select
              value={filterAttendance}
              onChange={(e) => setFilterAttendance(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">Semua Undangan</option>
              <option value="HADIR">Sudah Hadir</option>
              <option value="BELUM">Belum Hadir</option>
            </select>
          </div>
        </div>

        {/* Table of Lecturers */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500">Memuat data undangan dosen...</div>
          ) : filteredLecturers.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              Tidak ada data undangan dosen yang sesuai kriteria pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Kode</th>
                    <th className="px-4 py-3 font-semibold">Nama & Gelar Dosen</th>
                    <th className="px-4 py-3 font-semibold">Kontak</th>
                    <th className="px-4 py-3 font-semibold">Kehadiran</th>
                    <th className="px-4 py-3 font-semibold">Status Akses</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi Undangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLecturers.map((lec) => {
                    const checkin = checkins.find(
                      (c) => c.subjectType === 'DOSEN' && c.subjectId === lec.id
                    );

                    return (
                      <tr key={lec.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-neutral-800">
                          {lec.inviteCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-neutral-900">{lec.name}</div>
                          <div className="text-[11px] text-neutral-500">{lec.email}</div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 font-mono text-[11px]">
                          {lec.phone}
                        </td>
                        <td className="px-4 py-3">
                          {checkin ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle size={12} weight="fill" /> Hadir
                              </span>
                              <div className="text-[10px] text-neutral-400">
                                {formatWibDateTime(checkin.checkedInAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                              <Clock size={12} /> Belum Hadir
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(lec)}
                            title="Klik untuk mengubah status aktif/nonaktif"
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${
                              lec.active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {lec.active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(lec.inviteToken)}
                              title="Salin Tautan Undangan Digital"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            >
                              <Copy size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenWhatsApp(lec)}
                              title="Kirim via WhatsApp"
                              className="p-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              <WhatsappLogo size={14} weight="fill" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSimulateEmail(lec)}
                              title="Kirim via Email (Simulasi)"
                              className="p-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <EnvelopeSimple size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(lec)}
                              title="Edit Data Dosen"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            >
                              <PencilSimple size={14} />
                            </button>

                            <Link
                              href={`/undangan/${lec.inviteToken}`}
                              target="_blank"
                              title="Buka Halaman Undangan Dosen"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            >
                              <ArrowSquareOut size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingId ? 'Edit Data Undangan Dosen' : 'Tambah Undangan Dosen Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveModal} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="budisantoso@telkomuniversity.ac.id"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Email harus unik untuk undangan aktif.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 081234567890 atau 6281234567890"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <FloppyDisk size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan Undangan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
