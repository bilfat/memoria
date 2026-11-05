'use client';

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  listLecturerInvitationsAction,
  saveLecturerInvitationAction,
  toggleLecturerActiveAction,
  enqueueLecturerEmailAction,
  deleteLecturerInvitationPermanentlyAction,
  LecturerListItemDTO,
} from '@/app/actions/invitations';
import { formatWibTimeOnly } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  MagnifyingGlass,
  Copy,
  WhatsappLogo,
  EnvelopeSimple,
  PencilSimple,
  CheckCircle,
  FileText,
  Clock,
  ArrowSquareOut,
  X,
  FloppyDisk,
  ToggleLeft,
  ToggleRight,
  ArrowClockwise,
  Trash,
  Warning,
} from '@phosphor-icons/react';

export default function LecturerInvitationsPage() {
  const { success, error: toastError, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [lecturers, setLecturers] = useState<LecturerListItemDTO[]>([]);
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAttendance, setFilterAttendance] = useState<'ALL' | 'HADIR' | 'BELUM'>('ALL');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingLecId, setSendingLecId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<LecturerListItemDTO | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleOpenDelete = (lec: LecturerListItemDTO) => {
    setDeleteTarget(lec);
    setDeleteConfirmText('');
    setDeleteError(null);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;

    if (deleteConfirmText.trim().toUpperCase() !== 'HAPUS') {
      setDeleteError('Ketik kata "HAPUS" untuk mengonfirmasi penghapusan permanen.');
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const res = await deleteLecturerInvitationPermanentlyAction(deleteTarget.id);
      if (res.success) {
        success(
          'Undangan Dosen Dihapus Permanen',
          `Data undangan dosen ${deleteTarget.fullName} telah dihapus permanen dari database.`
        );
        setDeleteTarget(null);
        await loadData();
      } else {
        setDeleteError(res.error || 'Gagal menghapus data undangan dosen.');
        toastError('Gagal Menghapus', res.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await listLecturerInvitationsAction({
      searchQuery,
      filterAttendance,
    });
    if (res.success) {
      setLecturers(res.lecturers);
    } else {
      toastError('Gagal Memuat Data', res.error || 'Terjadi kesalahan sistem.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filterAttendance]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (lec: LecturerListItemDTO) => {
    setEditingId(lec.id);
    setFormName(lec.fullName);
    setFormEmail(lec.email);
    setFormPhone(lec.phone);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const res = await saveLecturerInvitationAction({
        id: editingId || undefined,
        fullName: formName,
        email: formEmail,
        phone: formPhone,
      });

      if (res.success) {
        success(
          editingId ? 'Data Dosen Diperbarui' : 'Undangan Dosen Dibuat',
          `Undangan untuk ${formName} berhasil disimpan.`
        );
        setModalOpen(false);
        loadData();
      } else {
        setFormError(res.error || 'Gagal menyimpan undangan dosen.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (lec: LecturerListItemDTO) => {
    startTransition(async () => {
      const res = await toggleLecturerActiveAction(lec.id);
      if (res.success) {
        success(
          res.newStatus ? 'Undangan Diaktifkan' : 'Undangan Dinonaktifkan',
          `Status undangan ${lec.fullName} telah diperbarui.`
        );
        loadData();
      } else {
        toastError('Gagal Mengubah Status', res.error || 'Terjadi kesalahan sistem.');
      }
    });
  };

  const handleCopyLink = (lec: LecturerListItemDTO) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/undangan/${lec.publicToken}`;
      navigator.clipboard.writeText(url);
      success('Tautan Disalin', `Link undangan untuk ${lec.fullName} siap dibagikan.`);
    }
  };

  const handleSendEmail = async (lec: LecturerListItemDTO) => {
    setSendingLecId(lec.id);
    try {
      const res = await enqueueLecturerEmailAction(lec.id);
      if (res.success) {
        success('Email Berhasil Dikirim', res.message || 'Surat undangan telah dikirimkan ke email dosen.');
      } else {
        toastError('Gagal Mengirim Email', res.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      toastError('Gagal Mengirim Email', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSendingLecId(null);
    }
  };

  const handleOpenWhatsApp = (lec: LecturerListItemDTO) => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const link = `${origin}/undangan/${lec.publicToken}`;
    const cleanPhone = lec.phone.replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.substring(1)
      : cleanPhone.startsWith('62')
      ? cleanPhone
      : '62' + cleanPhone;

    const message = `Yth. Bapak/Ibu ${lec.fullName},\n\nDengan hormat, segenap civitas akademika D4 Sistem Informasi Kota Cerdas mengundang Bapak/Ibu untuk berkenan hadir sebagai Tamu Kehormatan pada malam puncak Diesnatalis MEMORIA 2026 — Velvet Night.\n\nSurat undangan resmi dan pass check-in digital Bapak/Ibu dapat diakses melalui tautan berikut:\n${link}\n\nAtas perhatian dan kehadiran Bapak/Ibu, kami haturkan terima kasih sebesar-besarnya.\n\n— Panitia Pelaksana MEMORIA 2026`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    info('Membuka WhatsApp', 'Draft pesan undangan telah disiapkan di jendela WhatsApp Anda.');
  };

  return (
    <AdminShell title="Kelola Undangan Dosen" adminOnly={false}>
      <div className="space-y-6 max-w-7xl text-xs">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Daftar Undangan Dosen Kehormatan</h2>
            <p className="text-xs text-[#6B7280]">
              Kelola undangan personal, buat tautan QR eksklusif, dan kirimkan via Email atau WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/panitia/undangan/template"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] font-semibold hover:bg-[#F3F4F6] transition-colors"
            >
              <FileText size={16} />
              <span>Edit Template Surat</span>
            </Link>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] shadow-xs transition-colors"
            >
              <Plus size={16} weight="bold" />
              <span>Tambah Undangan Dosen</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau kode undangan..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
            />
          </form>

          <div className="flex items-center gap-2">
            <span className="text-[#6B7280] font-medium">Kehadiran:</span>
            <select
              value={filterAttendance}
              onChange={(e) => setFilterAttendance(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
            >
              <option value="ALL">Semua Undangan</option>
              <option value="HADIR">Sudah Hadir</option>
              <option value="BELUM">Belum Check-in</option>
            </select>

            <button
              onClick={loadData}
              disabled={loading || isPending}
              className="p-2 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#374151] transition-colors"
              title="Segarkan"
            >
              <ArrowClockwise size={15} className={loading || isPending ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-xs text-[#6B7280]">
              <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
              <div>Memuat data undangan dosen...</div>
            </div>
          ) : lecturers.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-2 text-xs text-[#6B7280]">
              <p className="font-semibold text-sm text-[#111827]">Belum Ada Undangan Dosen</p>
              <p>
                Tambahkan data dosen pertama untuk menerbitkan surat undangan resmi dan kode QR check-in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Nama Dosen & Gelar</th>
                    <th className="py-3.5 px-4">Kontak (Email / WhatsApp)</th>
                    <th className="py-3.5 px-4">Kode Undangan</th>
                    <th className="py-3.5 px-4">Status Undangan</th>
                    <th className="py-3.5 px-4">Kehadiran</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Kanal Pengiriman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {lecturers.map((lec) => {
                    return (
                      <tr key={lec.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">
                          <div>{lec.fullName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563]">
                          <div>{lec.email}</div>
                          <div className="font-mono text-[11px] text-[#6B7280]">{lec.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#891523]">
                          {lec.invitationCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleActive(lec)}
                            disabled={isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                              lec.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                            title="Klik untuk mengubah status aktif/nonaktif"
                          >
                            <span>{lec.isActive ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {lec.hasCheckedIn ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle size={12} weight="fill" />
                                <span>Hadir</span>
                              </span>
                              {lec.checkedInAt && (
                                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                                  {formatWibTimeOnly(lec.checkedInAt)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <Clock size={12} />
                              <span>Belum Check-in</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* WhatsApp draft link */}
                            <button
                              onClick={() => handleOpenWhatsApp(lec)}
                              className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition-colors"
                              title="Buka Draft Undangan di WhatsApp"
                            >
                              <WhatsappLogo size={16} weight="fill" />
                            </button>

                            {/* Email Brevo */}
                            <button
                              onClick={() => handleSendEmail(lec)}
                              disabled={sendingLecId === lec.id}
                              className={`p-1.5 rounded-md transition-colors ${
                                sendingLecId === lec.id
                                  ? 'bg-amber-100 text-amber-700 animate-pulse'
                                  : 'hover:bg-[#E5E7EB] text-[#4B5563]'
                              }`}
                              title="Kirim Email Undangan Resmi Langsung"
                            >
                              {sendingLecId === lec.id ? (
                                <div className="w-4 h-4 border-2 border-[#891523] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <EnvelopeSimple size={16} />
                              )}
                            </button>

                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(lec)}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
                              title="Salin Tautan Surat Undangan"
                            >
                              <Copy size={16} />
                            </button>

                            {/* Open Public Letter in new tab */}
                            <a
                              href={`/undangan/${lec.publicToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
                              title="Buka Halaman Surat Undangan"
                            >
                              <ArrowSquareOut size={16} />
                            </a>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(lec)}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151] transition-colors cursor-pointer"
                              title="Edit Data Dosen"
                            >
                              <PencilSimple size={16} />
                            </button>

                            {/* Hard Delete */}
                            <button
                              onClick={() => handleOpenDelete(lec)}
                              className="p-1.5 rounded-md hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="Hapus Permanen Undangan Dosen"
                            >
                              <Trash size={16} />
                            </button>
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#111827]">
                  {editingId ? 'Edit Data Dosen' : 'Tambah Undangan Dosen'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: budi@telkomuniversity.ac.id"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    * Satu email hanya boleh memiliki 1 undangan aktif.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D1D5DB] font-mono focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] disabled:opacity-50 transition-colors"
                  >
                    <FloppyDisk size={14} />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Undangan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Hard Delete Undangan Dosen */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <Trash size={18} weight="bold" />
                  <h3 className="text-sm font-bold">Hapus Undangan Dosen Permanen</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
                >
                  <X size={16} />
                </button>
              </div>

              {deleteError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 text-rose-950 space-y-2">
                <div className="flex items-start gap-2">
                  <Warning size={18} weight="fill" className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-800 block">Tindakan ini tidak dapat dibatalkan!</span>
                    <p className="text-[11px] leading-relaxed text-rose-700">
                      Surat undangan, kode QR kehormatan dosen, riwayat check-in presensi, serta email antrean akan <strong>terhapus permanen dari database</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Summary Card */}
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Nama Dosen:</span>
                  <span className="font-bold font-sans text-neutral-900">{deleteTarget.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Email:</span>
                  <span className="text-neutral-800">{deleteTarget.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Kode Undangan:</span>
                  <span className="font-bold text-[#891523]">{deleteTarget.invitationCode}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Ketik kata <span className="font-bold text-rose-700 font-mono">HAPUS</span> untuk mengonfirmasi:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Ketik HAPUS..."
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-rose-600 font-mono uppercase"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={deleteSubmitting || deleteConfirmText.trim().toUpperCase() !== 'HAPUS'}
                    className="px-4 py-2 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {deleteSubmitting ? 'Menghapus Permanen...' : 'Hapus Permanen dari Database'}
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
