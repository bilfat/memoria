'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { WinnerAnnouncement, EventContent } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  PencilSimple,
  Trash,
  FloppyDisk,
  Trophy,
  X,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function AdminAwardingCMSPage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [winners, setWinners] = useState<WinnerAnnouncement[]>(
    mockStore.getWinners('AWARDING')
  );

  const [teaserTitle, setTeaserTitle] = useState(event.awardingTeaser.title);
  const [teaserDesc, setTeaserDesc] = useState(event.awardingTeaser.description);
  const [savingTeaser, setSavingTeaser] = useState(false);

  // Winner modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWinner, setEditingWinner] = useState<WinnerAnnouncement | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [winnerName, setWinnerName] = useState('');
  const [winnerPhoto, setWinnerPhoto] = useState('');
  const [winnerDescription, setWinnerDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [submittingWinner, setSubmittingWinner] = useState(false);

  const { success } = useToast();

  const loadData = () => {
    eventAdapter.getEvent().then((ev) => {
      setEvent(ev);
      setTeaserTitle(ev.awardingTeaser.title);
      setTeaserDesc(ev.awardingTeaser.description);
    });
    eventAdapter.listWinners('AWARDING').then(setWinners);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleSaveTeaser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTeaser(true);
    try {
      await eventAdapter.updateEvent({
        awardingTeaser: {
          title: teaserTitle,
          description: teaserDesc,
        },
      });
      success('Teaser Diperbarui', 'Teks pengantar Awarding telah disimpan.');
    } finally {
      setSavingTeaser(false);
    }
  };

  const handleOpenAddWinner = () => {
    setEditingWinner(null);
    setCategoryName('');
    setWinnerName('');
    setWinnerPhoto('');
    setWinnerDescription('');
    setStatus('DRAFT');
    setModalOpen(true);
  };

  const handleOpenEditWinner = (w: WinnerAnnouncement) => {
    setEditingWinner(w);
    setCategoryName(w.categoryName);
    setWinnerName(w.winnerName);
    setWinnerPhoto(w.winnerPhoto || '');
    setWinnerDescription(w.winnerDescription);
    setStatus(w.status);
    setModalOpen(true);
  };

  const handleTogglePublish = async (w: WinnerAnnouncement) => {
    const updated = await eventAdapter.toggleWinnerPublish(w.id);
    success(
      updated.status === 'PUBLISHED' ? 'Pemenang Dipublikasikan' : 'Pemenang Dikembalikan ke Draft',
      `Kategori "${updated.categoryName}" ${
        updated.status === 'PUBLISHED' ? 'sekarang tampil di website publik.' : 'disembunyikan dari publik.'
      }`
    );
  };

  const handleDeleteWinner = async (id: string, cat: string) => {
    if (confirm(`Hapus pemenang penghargaan kategori "${cat}"?`)) {
      await eventAdapter.deleteWinner(id);
      success('Penghargaan Dihapus', `Data pemenang ${cat} berhasil dihapus.`);
    }
  };

  const handleSubmitWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !winnerName.trim()) return;

    setSubmittingWinner(true);
    try {
      await eventAdapter.saveWinner({
        id: editingWinner?.id,
        section: 'AWARDING',
        categoryName: categoryName.trim(),
        winnerName: winnerName.trim(),
        winnerPhoto: winnerPhoto.trim() || undefined,
        winnerDescription: winnerDescription.trim(),
        status,
        sortOrder: editingWinner ? editingWinner.sortOrder : winners.length + 1,
      });

      success(
        editingWinner ? 'Pemenang Diperbarui' : 'Pemenang Ditambahkan',
        status === 'PUBLISHED' ? 'Pemenang langsung tayang pada halaman publik.' : 'Disimpan sebagai Draft.'
      );
      setModalOpen(false);
    } finally {
      setSubmittingWinner(false);
    }
  };

  return (
    <AdminShell title="Kelola Awarding & Penghargaan Kehormatan" adminOnly={true}>
      <div className="space-y-8 max-w-5xl">
        {/* AREA A: Teaser CMS */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                A. Pengantar & Teaser Awarding
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Mengatur judul dan teks pengantar yang muncul di halaman publik /awarding.
              </p>
            </div>
            <Link
              href="/awarding"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:bg-[#F9FAFB]"
            >
              <ArrowSquareOut size={14} />
              <span>Buka Halaman Publik</span>
            </Link>
          </div>

          <form onSubmit={handleSaveTeaser} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">JUDUL HALAMAN</label>
              <input
                type="text"
                required
                value={teaserTitle}
                onChange={(e) => setTeaserTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#374151] mb-1">DESKRIPSI PENGANTAR</label>
              <textarea
                rows={2}
                required
                value={teaserDesc}
                onChange={(e) => setTeaserDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingTeaser}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] shadow-xs"
              >
                <FloppyDisk size={15} />
                <span>{savingTeaser ? 'Menyimpan...' : 'Simpan Pengantar'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* AREA B: Winners Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                B. Daftar Kategori & Penerima Penghargaan
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Pemenang ditentukan <strong>manual</strong> oleh panitia. Data berstatus <strong>Published</strong> langsung tampil di publik.
              </p>
            </div>
            <button
              onClick={handleOpenAddWinner}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs"
            >
              <Plus size={16} weight="bold" />
              <span>Tambah Penghargaan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kategori Penghargaan</th>
                  <th className="py-3 px-4">Penerima / Tim</th>
                  <th className="py-3 px-4">Keterangan Prestasi</th>
                  <th className="py-3 px-4">Status Publikasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {winners.length > 0 ? (
                  winners.map((winner) => (
                    <tr key={winner.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-800">
                        {winner.categoryName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#111827]">
                        {winner.winnerName}
                      </td>
                      <td className="py-3 px-4 text-[#4B5563] max-w-xs truncate">
                        {winner.winnerDescription}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            winner.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {winner.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePublish(winner)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                              winner.status === 'PUBLISHED'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={winner.status === 'PUBLISHED' ? 'Tarik ke Draft' : 'Publikasikan ke Website'}
                          >
                            {winner.status === 'PUBLISHED' ? 'Kembalikan Draft' : 'Publikasikan'}
                          </button>
                          <button
                            onClick={() => handleOpenEditWinner(winner)}
                            className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151]"
                            title="Edit Data"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteWinner(winner.id, winner.categoryName)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                            title="Hapus Data"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">
                      Belum ada penghargaan yang dibuat. Klik Tambah Penghargaan untuk membuat entri baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form Winner */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#111827]">
                  {editingWinner ? 'Edit Data Penghargaan' : 'Tambah Kategori Penghargaan'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitWinner} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">KATEGORI PENGHARGAAN *</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Contoh: Smart City Innovator of The Year"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">PENERIMA / TIM *</label>
                  <input
                    type="text"
                    required
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    placeholder="Contoh: Tim SIKC GreenIoT"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">URL FOTO / TROPHY</label>
                  <input
                    type="text"
                    value={winnerPhoto}
                    onChange={(e) => setWinnerPhoto(e.target.value)}
                    placeholder="/images/award.jpg"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">KETERANGAN PRESTASI</label>
                  <textarea
                    rows={3}
                    value={winnerDescription}
                    onChange={(e) => setWinnerDescription(e.target.value)}
                    placeholder="Uraian inovasi atau pencapaian yang diraih..."
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">STATUS PUBLIKASI</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="winnerStatus"
                        checked={status === 'DRAFT'}
                        onChange={() => setStatus('DRAFT')}
                        className="text-[#891523] focus:ring-[#891523]"
                      />
                      <span>Draft (Simpan internal, tidak tampil di publik)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="winnerStatus"
                        checked={status === 'PUBLISHED'}
                        onChange={() => setStatus('PUBLISHED')}
                        className="text-[#891523] focus:ring-[#891523]"
                      />
                      <span className="font-semibold text-emerald-700">Published (Langsung tayang)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWinner}
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] disabled:opacity-50"
                  >
                    {submittingWinner ? 'Menyimpan...' : 'Simpan Data Penghargaan'}
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
