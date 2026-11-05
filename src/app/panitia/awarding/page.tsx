'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicEventSettings, updateEventSettingsAction, EventSettingsDTO } from '@/app/actions/cms';
import { useToast } from '@/components/ui/Toast';
import { ArrowSquareOut, ToggleLeft, ToggleRight, Trophy, ShieldCheck } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AdminAwardingVisibilityPage() {
  const [event, setEvent] = useState<EventSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getPublicEventSettings().then(setEvent).catch((err) => toastError('Gagal Memuat', err.message));
  }, []);

  const handleToggle = async () => {
    if (!event || saving) return;
    const newStatus = !event.awardingPageVisible;
    setSaving(true);
    try {
      const res = await updateEventSettingsAction({
        awardingPageVisible: newStatus,
      });
      if (!res.success) throw new Error(res.message);

      setEvent({ ...event, awardingPageVisible: newStatus });
      success(
        'Status Visibilitas Diperbarui',
        newStatus
          ? 'Halaman /awarding kini DITAMPILKAN ke publik.'
          : 'Halaman /awarding kini berstatus COMING SOON untuk publik.'
      );
    } catch (err: any) {
      toastError('Gagal Mengubah Status', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <AdminShell title="Kelola Halaman Awarding" adminOnly={true}>
        <div className="py-12 text-center text-xs text-neutral-400">Memuat status halaman awarding...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Kelola Halaman Awarding" adminOnly={true}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Pengaturan Publikasi Halaman Awarding
            </h2>
            <p className="text-xs text-[#6B7280]">
              Kontrol status tayang publik halaman khusus /awarding untuk pengunjung website.
            </p>
          </div>
          <Link
            href="/awarding"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#374151] hover:bg-[#F9FAFB]"
          >
            <ArrowSquareOut size={15} />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {/* Section 1: Main Toggle Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#111827]">
                  Status Tayang Publik:
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    event.awardingPageVisible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {event.awardingPageVisible ? '● Halaman Aktif (Tayang)' : '○ Coming Soon (Tertutup)'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {event.awardingPageVisible
                  ? 'Pengunjung dapat mengakses tampilan panggung kehormatan The Golden Moment Awarding.'
                  : 'Pengunjung yang membuka tautan /awarding akan melihat pesan Coming Soon teatrikal.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer ${
                event.awardingPageVisible
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {event.awardingPageVisible ? (
                <>
                  <ToggleRight size={20} />
                  <span>{saving ? 'Menyimpan...' : 'Tutup Jadi Coming Soon'}</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={20} />
                  <span>{saving ? 'Menyimpan...' : 'Buka Halaman Publik'}</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Phase 1 & Phase 2 Information Notice */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#374151]">
              <ShieldCheck size={18} className="text-[#891523]" />
              <span>Arsitektur Modul Phase 1 & Rencana Phase 2</span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Pada Phase 1, halaman ini murni mengontrol visibilitas publik perayaan penghargaan.
              Kategori nominasi, voting civitas akademika, dan pengumuman pemenang resmi dipersiapkan
              untuk Phase 2 tanpa data pemenang fiktif atau simulasi dummy.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/panitia/website/teaser-awarding"
                className="text-xs text-[#891523] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Edit narasi teaser Beranda di sini &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

