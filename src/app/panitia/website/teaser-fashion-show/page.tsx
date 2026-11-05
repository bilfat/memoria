'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicEventSettings, updateEventSettingsAction, EventSettingsDTO } from '@/app/actions/cms';
import { compressClientImage } from '@/lib/imageCompression';
import { useToast } from '@/components/ui/Toast';
import { FloppyDisk, ArrowSquareOut, UploadSimple, Image as ImageIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AdminTeaserFashionShowPage() {
  const [event, setEvent] = useState<EventSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getPublicEventSettings().then(setEvent).catch((err) => toastError('Gagal Memuat', err.message));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    setUploading(true);
    try {
      const compressed = await compressClientImage(file, 2000, 0.88);

      const authRes = await fetch('/api/uploads/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'fashion',
          fileName: compressed.fileName,
          contentType: compressed.contentType,
          fileSize: compressed.compressedSize,
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData.success) {
        throw new Error(authData.error?.message || 'Gagal mengotorisasi upload gambar.');
      }

      const uploadRes = await fetch(authData.data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': compressed.contentType },
        body: compressed.blob,
      });

      if (!uploadRes.ok) throw new Error('Gagal mengunggah foto ke Supabase Storage.');

      setEvent({
        ...event,
        fashionImagePath: authData.data.publicUrl,
      });

      success('Foto Berhasil Diunggah', 'Foto model runway Fashion Show telah diperbarui.');
    } catch (err: any) {
      toastError('Gagal Mengunggah', err.message);
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
      success('Perubahan Disimpan', 'Teaser Fashion Show di Beranda berhasil diperbarui.');
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <AdminShell title="Kelola Teaser Fashion Show" adminOnly={true}>
        <div className="py-12 text-center text-xs text-neutral-400">Memuat data teaser fashion show...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Kelola Teaser Fashion Show" adminOnly={true}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Teaser Fashion Show (Beranda MEMORIA)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Atur foto model runway, judul, dan deskripsi teaser panggung runway pada landing page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/#fashion-showcase"
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

        {/* Section: Runway Model Photo */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Foto Model Runway Panggung
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-36 h-48 rounded-xl border border-[#E5E7EB] bg-[#1a0508] flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-2">
              {event.fashionImagePath ? (
                <img
                  src={event.fashionImagePath}
                  alt="Model Preview"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              ) : (
                <ImageIcon size={32} className="text-neutral-500" />
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-xs font-semibold text-[#374151]">
                UNGGAH FOTO MODEL RUNWAY (TRANSPARAN / PNG / WEBP)
              </label>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Disarankan foto model tegak berlatar belakang transparan (PNG atau WebP). Sistem akan
                mengompres dan menyimpannya di Supabase Storage secara otomatis.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D1D5DB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] cursor-pointer">
                  <UploadSimple size={16} />
                  <span>{uploading ? 'Mengompres & Mengunggah...' : 'Pilih Foto Baru'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                {event.fashionImagePath && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ✓ Foto tersimpan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Editorial Narrative */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Teks Editorial Teaser Runway
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              JUDUL TEASER FASHION SHOW
            </label>
            <input
              type="text"
              required
              value={event.fashionTitle}
              onChange={(e) => setEvent({ ...event, fashionTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              DESKRIPSI TEASER
            </label>
            <textarea
              rows={4}
              required
              value={event.fashionDescription}
              onChange={(e) => setEvent({ ...event, fashionDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

