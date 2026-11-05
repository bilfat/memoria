'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { saveTicketAction } from '@/app/actions/tickets';
import { DateTimePicker24 } from '@/components/admin/DateTimePicker24';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, FloppyDisk, Lock } from '@phosphor-icons/react';

export default function CreateTicketTypePage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLimited, setIsLimited] = useState(true);
  const [capacity, setCapacity] = useState<number>(100);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setOpensAt(new Date().toISOString());
    setClosesAt(new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (new Date(closesAt) <= new Date(opensAt)) {
      setErrorMsg('Waktu penutupan pendaftaran harus lebih akhir dari waktu pembukaan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await saveTicketAction({
        name: name.trim(),
        description: description.trim() || undefined,
        capacity: isLimited ? Number(capacity) : null,
        registrationOpenAt: opensAt,
        registrationCloseAt: closesAt,
        status,
      });

      if (res.success) {
        success('Tiket Berhasil Dibuat', `Jenis tiket "${name}" telah disimpan.`);
        router.push('/panitia/tiket');
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan jenis tiket.');
        toastError('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan jenis tiket.');
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Buat Jenis Tiket Baru" adminOnly={true}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/tiket"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-2.5 rounded-lg border border-[#E5E7EB] bg-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Tiket</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Formulir Tambah Jenis Tiket Gratis
          </h2>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">NAMA JENIS TIKET *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Tiket Reguler Mahasiswa Tel-U"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">DESKRIPSI (OPSIONAL)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan hak akses tiket atau ketentuan kehadiran..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>

            {/* Price: Free guarantee */}
            <div className="p-3.5 rounded-xl bg-[#FAEDEF]/60 border border-[#891523]/20 flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#891523] block">Harga Tiket: Rp 0 (GRATIS)</span>
                <span className="text-[11px] text-[#6B7280]">
                  Sesuai kebijakan MEMORIA 2026, seluruh tiket masuk diesnatalis tidak dipungut biaya.
                </span>
              </div>
              <Lock size={18} className="text-[#891523]" />
            </div>

            {/* Quota limit toggle */}
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#374151] block">Batasi Kuota Pendaftaran?</span>
                  <span className="text-[11px] text-[#6B7280]">
                    Pilih batas jumlah peserta atau biarkan tanpa batas (unlimited).
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLimited}
                    onChange={(e) => setIsLimited(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#891523]"></div>
                </label>
              </div>

              {isLimited && (
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <label className="block font-semibold text-[#374151] mb-1">JUMLAH KUOTA (KURSI) *</label>
                  <input
                    type="number"
                    min={1}
                    required={isLimited}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    Kuota akan otomatis berkurang ketika ada peserta aktif yang mendaftar.
                  </span>
                </div>
              )}
            </div>

            {/* Registration Period: 24-hour WIB DateTimePicker */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-4">
              <span className="font-semibold text-[#374151] block border-b border-[#E5E7EB] pb-2">
                Periode Pendaftaran Tiket (WIB)
              </span>

              <DateTimePicker24
                label="Waktu Buka Pendaftaran"
                required={true}
                valueIso={opensAt}
                onChangeIso={setOpensAt}
                helperText="Tiket akan berstatus 'Upcoming / Belum Dibuka' sebelum waktu ini."
              />

              <DateTimePicker24
                label="Waktu Tutup Pendaftaran"
                required={true}
                valueIso={closesAt}
                onChangeIso={setClosesAt}
                helperText="Tiket akan berstatus 'Closed / Ditutup' setelah waktu ini."
              />
            </div>

            {/* Publication Status */}
            <div>
              <label className="block font-semibold text-[#374151] mb-1">STATUS PUBLIKASI *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523] bg-white cursor-pointer"
              >
                <option value="published">Published (Dapat dilihat mahasiswa di /daftar)</option>
                <option value="draft">Draft (Disembunyikan dari halaman publik)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-2">
              <Link
                href="/panitia/tiket"
                className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <FloppyDisk size={15} />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Jenis Tiket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
