'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  getInvitationTemplateAction,
  updateInvitationTemplateAction,
  InvitationTemplateDTO,
} from '@/app/actions/invitations';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, FloppyDisk, Eye, Sparkle, ArrowCounterClockwise } from '@phosphor-icons/react';

export default function InvitationTemplatePage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [template, setTemplate] = useState<InvitationTemplateDTO>({
    subject: '',
    greeting: '',
    body: '',
    closing: '',
    senderName: '',
  });

  const [previewLecturerName, setPreviewLecturerName] = useState('Dr. Ir. Budi Santoso, M.T.');

  useEffect(() => {
    getInvitationTemplateAction()
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        toastError('Gagal Memuat', err.message || 'Gagal memuat template undangan');
        setLoading(false);
      });
  }, [toastError]);

  const handleChange = (field: keyof InvitationTemplateDTO, val: string) => {
    setTemplate((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateInvitationTemplateAction(template);
      if (res.success) {
        success('Template Disimpan', 'Format surat undangan dosen berhasil disimpan ke database.');
      } else {
        toastError('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Kembalikan redaksi template ke kalimat standar panitia?')) return;
    const defaultTpl: InvitationTemplateDTO = {
      subject: 'Undangan Kehormatan Malam Puncak MEMORIA 2026 — Diesnatalis SIKC',
      greeting: 'Kepada Yang Terhormat,',
      body:
        'Merupakan suatu kehormatan dan kebanggaan bagi kami, segenap civitas akademika dan panitia pelaksana Dies Natalis D4 Sistem Informasi Kota Cerdas, untuk mengundang Bapak/Ibu {{nama_dosen}} hadir sebagai Tamu Kehormatan dalam malam puncak MEMORIA — "Velvet Night: A Night to Remember". Kehadiran Bapak/Ibu merupakan wujud apresiasi dan inspirasi terbesar bagi seluruh karya dan prestasi mahasiswa.',
      closing: 'Atas perhatian, bimbingan, dan kehadiran Bapak/Ibu, kami haturkan terima kasih sebesar-besarnya.',
      senderName: 'Panitia Pelaksana MEMORIA 2026 & Himpunan Mahasiswa SIKC',
    };
    setTemplate(defaultTpl);
    try {
      const res = await updateInvitationTemplateAction(defaultTpl);
      if (res.success) {
        success('Direset', 'Template surat dikembalikan ke format standar awal.');
      }
    } catch (err: any) {
      toastError('Gagal Reset', err.message);
    }
  };

  // Interpolate body for live preview
  const interpolatedBody = template.body.replace(
    /\{\{nama_dosen\}\}/g,
    previewLecturerName
  );

  if (loading) {
    return (
      <AdminShell title="Kelola Template Undangan Dosen" adminOnly={true}>
        <div className="p-12 text-center text-xs text-neutral-500">
          <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
          <div>Memuat template surat undangan...</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Template Surat Undangan Dosen" adminOnly={true}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/panitia/undangan/dosen"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-3 rounded-lg border border-[#E5E7EB] bg-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Dosen</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Reset ke format standar panitia"
            >
              <ArrowCounterClockwise size={14} />
              <span>Reset Standar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#891523] text-white text-xs font-semibold hover:bg-[#720e1a] shadow-xs disabled:opacity-50 transition-colors"
            >
              <FloppyDisk size={14} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Template'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI: Form Editor (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-200 pb-3">
              Redaksi Surat Undangan
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Subjek Email Undangan *
                </label>
                <input
                  type="text"
                  required
                  value={template.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#891523]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Salam Pembuka (Greeting) *
                </label>
                <input
                  type="text"
                  required
                  value={template.greeting}
                  onChange={(e) => handleChange('greeting', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#891523]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-neutral-700">
                    Isi Paragraf Surat Undangan *
                  </label>
                  <span className="text-[11px] font-mono text-[#891523] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Placeholder: {'{{nama_dosen}}'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={template.body}
                  onChange={(e) => handleChange('body', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#891523] leading-relaxed"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Gunakan variabel <code>{'{{nama_dosen}}'}</code> untuk menyisipkan nama dan gelar dosen secara otomatis pada setiap surat personal.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Kalimat Penutup (Closing) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={template.closing}
                  onChange={(e) => handleChange('closing', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#891523]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Pengirim / Penyelenggara *
                </label>
                <input
                  type="text"
                  required
                  value={template.senderName}
                  onChange={(e) => handleChange('senderName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#891523]"
                />
              </div>
            </form>
          </div>

          {/* KOLOM KANAN: Live Letter Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                <Eye size={15} />
                <span>Pratinjau Surat Resmi</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <span>Nama Uji:</span>
                <input
                  type="text"
                  value={previewLecturerName}
                  onChange={(e) => setPreviewLecturerName(e.target.value)}
                  className="px-2 py-0.5 rounded border border-neutral-300 bg-white text-[11px] w-36"
                />
              </div>
            </div>

            {/* Simulated Vintage Letter Sheet */}
            <div className="bg-[#FFFDF8] rounded-2xl border-2 border-[#D6B46A]/60 p-6 sm:p-7 shadow-md text-neutral-800 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D6B46A]/20 to-transparent pointer-events-none rounded-bl-full" />

              <div className="text-center border-b border-[#D6B46A]/40 pb-4 space-y-1">
                <div className="font-serif text-lg font-bold text-[#891523] tracking-wider">
                  M E M O R I A
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#A67B39] uppercase">
                  SURAT UNDANGAN KEHORMATAN
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p className="font-semibold text-neutral-900">{template.greeting}</p>
                <p className="text-justify text-neutral-700 whitespace-pre-wrap">{interpolatedBody}</p>
                <p className="text-neutral-700">{template.closing}</p>
              </div>

              <div className="pt-4 border-t border-[#D6B46A]/40 text-right">
                <p className="text-[11px] text-neutral-500">Hormat kami,</p>
                <p className="font-serif font-bold text-xs text-[#891523] mt-1">{template.senderName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
