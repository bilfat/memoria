'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  listAccountsAction,
  createAccountAction,
  updateAccountAction,
  toggleAccountStatusAction,
  resetAccountPasswordAction,
  getCurrentStaffSession,
} from '@/app/actions/auth';
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
  const [currentUser, setCurrentUser] = useState<InternalAccount | null>(null);

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
      const [accountsRes, userRes] = await Promise.all([
        listAccountsAction(),
        getCurrentStaffSession(),
      ]);

      if (accountsRes.success && accountsRes.data) {
        setAccounts(accountsRes.data);
      } else {
        toastError('Gagal Memuat Akun', accountsRes.message || 'Terjadi kesalahan sistem.');
      }

      setCurrentUser(userRes);
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

  const handleOpenReset = (acc: InternalAccount) => {
    setResetTargetAccount(acc);
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    setResetModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSaving(true);

    try {
      if (editingId) {
        const res = await updateAccountAction({
          id: editingId,
          fullName: formName,
          role: formRole,
        });

        if (!res.success) throw new Error(res.message);
        success('Akun Diperbarui', `Data akun ${formName} berhasil disimpan.`);
      } else {
        if (!formPassword || formPassword.length < 6) {
          throw new Error('Password awal minimal 6 karakter.');
        }

        const res = await createAccountAction({
          fullName: formName,
          email: formEmail,
          role: formRole,
          password: formPassword,
        });

        if (!res.success) throw new Error(res.message);
        success('Akun Dibuat', `Akun panitia ${formName} berhasil didaftarkan.`);
      }

      setAccountModalOpen(false);
      await loadAccounts();
    } catch (err: any) {
      setModalError(err.message || 'Gagal menyimpan akun.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleToggleStatus = async (acc: InternalAccount) => {
    const nextStatus = acc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'mengaktifkan' : 'menonaktifkan';

    if (!window.confirm(`Yakin ingin ${actionLabel} akun ${acc.fullName}?`)) {
      return;
    }

    try {
      const res = await toggleAccountStatusAction({
        id: acc.id,
        targetStatus: nextStatus,
      });

      if (!res.success) throw new Error(res.message);
      success('Status Diperbarui', `Status akun ${acc.fullName} diubah menjadi ${nextStatus}.`);
      await loadAccounts();
    } catch (err: any) {
      toastError('Gagal Mengubah Status', err.message);
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('Password minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok.');
      return;
    }

    if (!resetTargetAccount) return;

    setResetSaving(true);
    try {
      const res = await resetAccountPasswordAction({
        id: resetTargetAccount.id,
        newPassword,
      });

      if (!res.success) throw new Error(res.message);
      success('Password Direset', `Password akun ${resetTargetAccount.fullName} berhasil diubah.`);
      setResetModalOpen(false);
    } catch (err: any) {
      setResetError(err.message || 'Gagal mereset password.');
    } finally {
      setResetSaving(false);
    }
  };

  return (
    <AdminShell title="Kelola Akun Panitia" adminOnly={true}>
      <div className="space-y-6">
        {/* Header Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Daftar Petugas & Administrator
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Kelola hak akses internal sistem MEMORIA 2026.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#891523] text-white text-xs font-semibold hover:bg-[#720e1a] transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Tambah Akun Panitia</span>
          </button>
        </div>

        {/* Account Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email Login</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Memuat daftar akun panitia...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Belum ada akun panitia terdaftar.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => {
                    const isSelf = currentUser?.id === acc.id;
                    const isActive = acc.status === 'ACTIVE';

                    return (
                      <tr key={acc.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#111827]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FAEDEF] text-[#891523] flex items-center justify-center font-bold text-xs shrink-0">
                              {acc.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div>{acc.fullName}</div>
                              {isSelf && (
                                <span className="text-[10px] text-[#891523] font-normal">
                                  (Sesi Anda Saat Ini)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563] font-mono text-[11px]">
                          {acc.email}
                        </td>
                        <td className="py-3.5 px-4">
                          {acc.role === 'ADMIN_PANITIA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                              <ShieldCheck size={14} />
                              <span>Admin Panitia</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                              <User size={14} />
                              <span>Petugas Check-in</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle size={14} weight="fill" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neutral-400 font-medium">
                              <XCircle size={14} weight="fill" />
                              <span>Nonaktif</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(acc)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                              title="Edit Nama & Role"
                            >
                              <PencilSimple size={15} />
                            </button>

                            <button
                              onClick={() => handleOpenReset(acc)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                              title="Reset Password"
                            >
                              <Key size={15} />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(acc)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                isActive
                                  ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Create / Edit Account */}
        {accountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => !modalSaving && setAccountModalOpen(false)}
            />
            <div className="relative max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 space-y-5 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#111827]">
                  {editingId ? 'Edit Data Akun Panitia' : 'Tambah Akun Panitia Baru'}
                </h3>
                <button
                  onClick={() => setAccountModalOpen(false)}
                  disabled={modalSaving}
                  className="p-1 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <WarningCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    NAMA LENGKAP
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    EMAIL LOGIN
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingId}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin@memoria.telkom.id"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523] disabled:bg-neutral-100 disabled:text-neutral-500"
                  />
                  {editingId && (
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Email tidak dapat diubah setelah akun dibuat.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    PERAN (ROLE)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  >
                    <option value="PETUGAS_CHECKIN">Petugas Check-in (Khusus Meja Hadir & Scanner)</option>
                    <option value="ADMIN_PANITIA">Admin Panitia (Akses Penuh Seluruh Modul)</option>
                  </select>
                </div>

                {!editingId && (
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      PASSWORD AWAL
                    </label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountModalOpen(false)}
                    disabled={modalSaving}
                    className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-[#4B5563] hover:bg-neutral-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="px-5 py-2 rounded-xl bg-[#891523] text-white font-semibold hover:bg-[#720e1a] transition-colors shadow-xs"
                  >
                    {modalSaving ? 'Menyimpan...' : 'Simpan Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Reset Password */}
        {resetModalOpen && resetTargetAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => !resetSaving && setResetModalOpen(false)}
            />
            <div className="relative max-w-sm w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 space-y-4 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#111827]">
                  Reset Password Akun
                </h3>
                <button
                  onClick={() => setResetModalOpen(false)}
                  disabled={resetSaving}
                  className="p-1 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#6B7280]">
                Mengganti password akun untuk <strong>{resetTargetAccount.fullName}</strong> ({resetTargetAccount.email}).
              </p>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <WarningCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleSaveResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    PASSWORD BARU
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    KONFIRMASI PASSWORD BARU
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    disabled={resetSaving}
                    className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-[#4B5563] hover:bg-neutral-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSaving}
                    className="px-5 py-2 rounded-xl bg-[#891523] text-white font-semibold hover:bg-[#720e1a] transition-colors shadow-xs"
                  >
                    {resetSaving ? 'Menyimpan...' : 'Ganti Password'}
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
