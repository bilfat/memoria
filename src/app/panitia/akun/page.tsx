'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { accountAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { InternalAccount, Role, AccountStatus } from '@/types';
import {
  Plus,
  ShieldCheck,
  User,
  Key,
  PencilSimple,
  CheckCircle,
  XCircle,
  X,
  FloppyDisk,
  WarningCircle,
  LockKey,
} from '@phosphor-icons/react';

export default function AccountManagementPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<InternalAccount[]>([]);
  const currentUser = accountAdapter.getCurrentUser();

  // Create / Edit modal state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('PETUGAS_CHECKIN');
  const [formPassword, setFormPassword] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Reset password modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetAccount, setResetTargetAccount] = useState<InternalAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      const list = await accountAdapter.listAccounts();
      setAccounts(list);
    } catch (err: any) {
      toastError('Gagal Memuat Akun', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('PETUGAS_CHECKIN');
    setFormPassword('');
    setModalError(null);
    setAccountModalOpen(true);
  };

  const handleOpenEdit = (acc: InternalAccount) => {
    setEditingId(acc.id);
    setFormName(acc.fullName);
    setFormEmail(acc.email);
    setFormRole(acc.role);
    setFormPassword('');
    setModalError(null);
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setModalError('Nama lengkap dan email wajib diisi.');
      return;
    }

    if (!editingId && formPassword.length < 8) {
      setModalError('Kata sandi awal minimal 8 karakter.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingId) {
        await accountAdapter.saveAccount({
          id: editingId,
          fullName: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          status: 'ACTIVE',
        });
        success('Akun Diperbarui', `Perubahan akun ${formName} berhasil disimpan.`);
      } else {
        await accountAdapter.saveAccount({
          fullName: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          status: 'ACTIVE',
          password: formPassword,
        });
        success('Akun Dibuat', `Akun internal ${formName} (${formRole}) siap digunakan.`);
      }

      setAccountModalOpen(false);
      await loadAccounts();
    } catch (err: any) {
      setModalError(err.message || 'Gagal menyimpan akun.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleOpenReset = (acc: InternalAccount) => {
    setResetTargetAccount(acc);
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    setResetModalOpen(true);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetAccount) return;

    if (newPassword.length < 8) {
      setResetError('Kata sandi baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setResetSaving(true);
    try {
      await accountAdapter.resetPassword(resetTargetAccount.id, newPassword);
      success(
        'Kata Sandi Direset',
        `Kata sandi untuk ${resetTargetAccount.fullName} berhasil diperbarui.`
      );
      setResetModalOpen(false);
    } catch (err: any) {
      setResetError(err.message || 'Gagal mereset kata sandi.');
    } finally {
      setResetSaving(false);
    }
  };

  const handleToggleStatus = async (acc: InternalAccount) => {
    if (acc.id === currentUser?.id) {
      if (!confirm('Anda sedang mengubah status akun Anda sendiri. Lanjutkan?')) return;
    }

    try {
      const updated = await accountAdapter.toggleStatus(acc.id);
      success(
        'Status Berubah',
        `Akun ${acc.fullName} kini berstatus ${updated.status}.`
      );
      await loadAccounts();
    } catch (err: any) {
      toastError('Gagal Mengubah Status', err.message);
    }
  };

  const adminCount = accounts.filter((a) => a.role === 'ADMIN_PANITIA').length;
  const staffCount = accounts.filter((a) => a.role === 'PETUGAS_CHECKIN').length;

  return (
    <AdminShell title="Kelola Akun Panitia & Petugas Presensi" adminOnly={true}>
      <div className="space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Total Akun Terdaftar
            </span>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{accounts.length}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Semua pengguna internal</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Admin Panitia
            </span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">{adminCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Akses penuh seluruh modul</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Petugas Check-in
            </span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">{staffCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Akses khusus meja registrasi</p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Daftar kredensial operator internal MEMORIA 2026 dengan aturan perlindungan Last Admin.
          </p>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Plus size={15} /> Tambah Akun Pengguna
          </button>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500">Memuat data akun...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                    <th className="px-4 py-3 font-semibold">Alamat Email</th>
                    <th className="px-4 py-3 font-semibold">Peran (Role)</th>
                    <th className="px-4 py-3 font-semibold">Status Akun</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {accounts.map((acc) => {
                    const isSelf = acc.id === currentUser?.id;
                    return (
                      <tr key={acc.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                            {acc.fullName}
                            {isSelf && (
                              <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-normal">
                                Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-600">{acc.email}</td>
                        <td className="px-4 py-3">
                          {acc.role === 'ADMIN_PANITIA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              <ShieldCheck size={12} weight="fill" /> Admin Panitia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <User size={12} /> Petugas Check-in
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(acc)}
                            title="Klik untuk mengubah status aktif/nonaktif"
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${
                              acc.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {acc.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenReset(acc)}
                              title="Reset Kata Sandi"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
                            >
                              <Key size={13} /> Reset Sandi
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(acc)}
                              title="Edit Profil Akun"
                              className="p-1 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                            >
                              <PencilSimple size={14} />
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

        {/* Modal Create / Edit Account */}
        {accountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingId ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  <X size={16} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama operator"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Alamat Email Login *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@memoria.ac.id"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Peran Akun *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="PETUGAS_CHECKIN">Petugas Check-in (Registrasi Presensi)</option>
                    <option value="ADMIN_PANITIA">Admin Panitia (Akses Penuh Semua Modul)</option>
                  </select>
                </div>

                {!editingId && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Kata Sandi Awal (Min. 8 Karakter) *
                    </label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setAccountModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <FloppyDisk size={14} />
                    {modalSaving ? 'Menyimpan...' : 'Simpan Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Reset Password */}
        {resetModalOpen && resetTargetAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">Reset Kata Sandi Akun</h3>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                Mengatur ulang kata sandi untuk <strong>{resetTargetAccount.fullName}</strong> (
                {resetTargetAccount.email}).
              </div>

              {resetError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleExecuteReset} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Kata Sandi Baru *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Konfirmasi Kata Sandi *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <Key size={14} />
                    {resetSaving ? 'Mereset...' : 'Simpan Kata Sandi'}
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
