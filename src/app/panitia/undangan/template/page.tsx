'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { invitationAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { InvitationTemplate } from '@/types';
import { ArrowLeft, FloppyDisk, Eye, Sparkle, ArrowCounterClockwise } from '@phosphor-icons/react';

export default function InvitationTemplatePage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [template, setTemplate] = useState<InvitationTemplate>({
    subject: '',
    greeting: '',
    body: '',
    closing: '',
    senderName: '',
  });

  const [previewLecturerName, setPreviewLecturerName] = useState('Dr. Ir. Budi Santoso, M.T.');

  useEffect(() => {
    invitationAdapter
      .getTemplate()
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        toastError('Gagal Memuat', err.message || 'Gagal memuat template undangan');
        setLoading(false);
      });
  }, [toastError]);

  const handleChange = (field: keyof InvitationTemplate, val: string) => {
    setTemplate((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await invitationAdapter.updateTemplate(template);
      success('Template Disimpan', 'Format surat undangan dosen berhasil diperbarui.');
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Kembalikan redaksi template ke kalimat standar panitia?')) return;
    const defaultTpl: InvitationTemplate = {
      subject: 'Undangan Kehormatan Malam Penganugerahan MEMORIA 2026',
      greeting: 'Kepada Yang Terhormat,',
      body:
        'Merupakan suatu kehormatan dan kebanggaan bagi kami, segenap civitas akademika dan panitia pelaksana Dies Natalis D4 Sistem Informasi Kota Cerdas, untuk mengundang Bapak/Ibu {{nama_dosen}} hadir sebagai Tamu Kehormatan dalam malam puncak MEMORIA — "Velvet Night: A Night to Remember". Kehadiran Bapak/Ibu merupakan wujud apresiasi dan inspirasi terbesar bagi seluruh karya dan prestasi mahasiswa.',
      closing: 'Atas perhatian, bimbingan, dan kehadiran Bapak/Ibu, kami haturkan terima kasih sebesar-besarnya.',
      senderName: 'Panitia Pelaksana MEMORIA 2026 & Himpunan Mahasiswa SIKC',
    };
    setTemplate(defaultTpl);
    try {
      await invitationAdapter.updateTemplate(defaultTpl);
      success('Direset', 'Template undangan dikembalikan ke standar awal.');
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
        <div className="p-8 text-center text-sm text-neutral-500">Memuat template undangan...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Template Surat Undangan Dosen" adminOnly={true}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/panitia/undangan/dosen"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> Kembali ke Daftar Dosen
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <ArrowCounterClockwise size={14} /> Reset ke Standar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Editor */}
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Editor Redaksi Undangan</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gunakan placeholder <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px] font-bold text-neutral-800">{'{{nama_dosen}}'}</code> untuk menyisipkan nama dosen secara dinamis.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Subjek / Perihal Undangan *</label>
              <input
                type="text"
                required
                value={template.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Undangan Kehormatan Malam Puncak..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Salam Pembuka (Greeting) *</label>
              <input
                type="text"
                required
                value={template.greeting}
                onChange={(e) => handleChange('greeting', e.target.value)}
                placeholder="Kepada Yang Terhormat,"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Paragraf Isi (Body Text) *</label>
              <textarea
                rows={7}
                required
                value={template.body}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="Merupakan suatu kehormatan mengundang Bapak/Ibu {{nama_dosen}}..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 leading-relaxed font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Kalimat Penutup (Closing) *</label>
              <input
                type="text"
                required
                value={template.closing}
                onChange={(e) => handleChange('closing', e.target.value)}
                placeholder="Atas perhatian dan kehadiran Bapak/Ibu..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Nama Pengirim / Tanda Tangan *</label>
              <input
                type="text"
                required
                value={template.senderName}
                onChange={(e) => handleChange('senderName', e.target.value)}
                placeholder="Panitia Pelaksana MEMORIA 2026..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
              >
                <FloppyDisk size={14} />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan Template'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Letter Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={15} /> Pratinjau Surat Undangan
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500">Nama Simulasi:</span>
                <input
                  type="text"
                  value={previewLecturerName}
                  onChange={(e) => setPreviewLecturerName(e.target.value)}
                  className="px-2 py-0.5 text-xs rounded border border-neutral-300 bg-white"
                />
              </div>
            </div>

            {/* Simulated Theatrical Letter */}
            <div className="rounded-2xl border-4 border-[#D6B46A]/60 bg-[#FAF6EE] p-8 shadow-xl text-neutral-900 space-y-6 relative overflow-hidden">
              {/* Gold watermark / monogram */}
              <div className="absolute right-4 top-4 text-[#D6B46A]/20 pointer-events-none text-8xl font-serif select-none font-bold">
                M
              </div>

              {/* Header Letter */}
              <div className="text-center border-b border-[#D6B46A]/40 pb-5 space-y-1">
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#891523]">
                  UNDANGAN KEHORMATAN
                </span>
                <h4 className="font-serif text-2xl font-bold tracking-tight text-[#140809]">
                  MEMORIA 2026
                </h4>
                <p className="text-[11px] text-neutral-600 font-sans tracking-wide">
                  Dies Natalis D4 Sistem Informasi Kota Cerdas — Universitas Telkom
                </p>
              </div>

              {/* Subject */}
              <div className="text-center font-serif italic text-sm text-[#891523] font-semibold">
                &ldquo;{template.subject}&rdquo;
              </div>

              {/* Salutation & Body */}
              <div className="space-y-3 font-serif text-xs leading-relaxed text-neutral-800">
                <p className="font-semibold text-neutral-900">
                  {template.greeting} <br />
                  <span className="text-sm font-bold text-[#891523] font-sans">
                    {previewLecturerName}
                  </span>
                </p>

                <p className="whitespace-pre-line text-justify indent-6">
                  {interpolatedBody}
                </p>

                {/* Event Schedule Box */}
                <div className="my-4 p-4 rounded-xl border border-[#D6B46A]/50 bg-white/70 font-sans text-xs space-y-1 text-neutral-800">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-[#891523] mb-1">
                    Detail Acara & Kehadiran:
                  </div>
                  <div><strong>Hari / Tanggal:</strong> Sabtu, 28 November 2026</div>
                  <div><strong>Waktu:</strong> 18.00 WIB s/d Selesai</div>
                  <div><strong>Tempat:</strong> Grand Ballroom Telkom Convention Hall</div>
                  <div><strong>Dress Code:</strong> Velvet Burgundy & Antique Gold Formal</div>
                </div>

                <p className="whitespace-pre-line">
                  {template.closing}
                </p>
              </div>

              {/* Signatory */}
              <div className="pt-4 border-t border-[#D6B46A]/30 flex flex-col items-end text-right font-serif text-xs text-neutral-800">
                <p className="italic">Hormat kami,</p>
                <div className="h-10 my-1 font-serif text-lg text-[#891523] font-bold opacity-60">
                  Panitia MEMORIA
                </div>
                <p className="font-bold font-sans text-[11px] text-neutral-900">
                  {template.senderName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
