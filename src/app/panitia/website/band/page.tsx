'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicEventSettings, updateEventSettingsAction, EventSettingsDTO } from '@/app/actions/cms';
import { compressClientImage } from '@/lib/imageCompression';
import { useToast } from '@/components/ui/Toast';
import { FloppyDisk, UploadSimple, ArrowSquareOut, MusicNotes } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AdminBandManagerPage() {
  const [event, setEvent] = useState<EventSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getPublicEventSettings().then(setEvent);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    setUploading(true);
    try {
      // 1. Kompresi di browser (maksimal 10 MB, alpha preserved)
      const compressed = await compressClientImage(file, 2000, 0.88);

      // 2. Minta signed authorization ke backend
      const authRes = await fetch('/api/uploads/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'band',
          fileName: compressed.fileName,
          contentType: compressed.contentType,
          fileSize: compressed.compressedSize,
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData.success) {
        throw new Error(authData.error?.message || 'Gagal mengotorisasi unggahan gambar.');
      }

      // 3. Upload langsung ke signedUrl Supabase Storage
      const uploadRes = await fetch(authData.data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': compressed.contentType },
        body: compressed.blob,
      });

      if (!uploadRes.ok) {
        throw new Error('Gagal mengunggah berkas ke Supabase Storage.');
      }

      setEvent({
        ...event,
        bandImagePath: authData.data.publicUrl,
      });

      success('Foto Berhasil Diunggah', 'Foto siluet band telah diperbarui di storage.');
    } catch (err: any) {
      toastError('Gagal Mengunggah', err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSaving(true);
    try {
      const res = await updateEventSettingsAction(event);
      if (!res.success) throw new Error(res.message);
      success('Perubahan Disimpan', 'Informasi band tunggal kini langsung tampil di panggung Beranda.');
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <AdminShell title="Kelola Penampil Band Utama" adminOnly={true}>
        <div className="py-12 text-center text-xs text-neutral-400">Memuat data band...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Kelola Penampil Band Utama" adminOnly={true}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Guest Star & Penampil Band Utama (Satu Band)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Sesuai spesifikasi Phase 1, panggung musik menampilkan satu band bintang tamu utama.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/#lineup-band"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#374151] hover:bg-[#F9FAFB]"
            >
              <ArrowSquareOut size={15} />
              <span>Lihat di Beranda</span>
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FloppyDisk size={16} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                NAMA BAND / GUEST STAR
              </label>
              <input
                type="text"
                required
                value={event.bandName}
                onChange={(e) => setEvent({ ...event, bandName: e.target.value })}
                placeholder="Contoh: Fosca Band"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                FOTO SILUET BAND (MAKS 10 MB - PNG/WEBP)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/webp,image/jpeg"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FAEDEF] file:text-[#891523] hover:file:bg-[#F3D7DC] cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {uploading ? 'Sedang mengompres & mengunggah foto...' : 'Disarankan PNG transparan tanpa background agar siluet panggung teater optimal.'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              DESKRIPSI / NARASI PENAMPIL
            </label>
            <textarea
              rows={3}
              value={event.bandDescription}
              onChange={(e) => setEvent({ ...event, bandDescription: e.target.value })}
              placeholder="Deskripsi aliran musik atau aransemen penampilan panggung..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>

          {/* Preview Image */}
          {event.bandImagePath && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-[#374151] block mb-2">Pratinjau Foto Panggung:</span>
              <div className="w-48 h-32 rounded-xl bg-neutral-900 border border-neutral-700 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={event.bandImagePath}
                  alt={event.bandName}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </AdminShell>
  );
}
