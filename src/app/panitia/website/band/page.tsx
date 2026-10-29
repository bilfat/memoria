'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Band } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Plus, PencilSimple, Trash, MusicNotes, Image, X } from '@phosphor-icons/react';

export default function AdminBandManagerPage() {
  const [bands, setBands] = useState<Band[]>(mockStore.getBands());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBand, setEditingBand] = useState<Band | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const { success, info } = useToast();

  const loadBands = () => {
    eventAdapter.listBands().then(setBands);
  };

  useEffect(() => {
    loadBands();
    const unsubscribe = mockStore.subscribe(loadBands);
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingBand(null);
    setName('');
    setDescription('');
    setPhoto('');
    setSortOrder(bands.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (band: Band) => {
    setEditingBand(band);
    setName(band.name);
    setDescription(band.description);
    setPhoto(band.photo || '');
    setSortOrder(band.sortOrder);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, bandName: string) => {
    if (confirm(`Hapus band "${bandName}" dari daftar penampilan?`)) {
      await eventAdapter.deleteBand(id);
      success('Band Dihapus', `Band ${bandName} telah dihapus dari lineup.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await eventAdapter.saveBand({
        id: editingBand?.id,
        name: name.trim(),
        description: description.trim(),
        photo: photo.trim() || undefined,
        sortOrder: Number(sortOrder) || 1,
      });
      success(
        editingBand ? 'Perubahan Band Disimpan' : 'Band Berhasil Ditambahkan',
        `Lineup ${name} kini langsung tampil di Beranda publik.`
      );
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Kelola Lineup Band Musik" adminOnly={true}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Daftar Penampil Panggung</h2>
            <p className="text-xs text-[#6B7280]">
              Band yang ada di daftar ini akan tampil di Beranda dengan layout asimetris editorial.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={16} weight="bold" />
            <span>Tambah Band</span>
          </button>
        </div>

        {/* Bands Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Urutan</th>
                  <th className="py-3 px-4">Foto Poster</th>
                  <th className="py-3 px-4">Nama Band</th>
                  <th className="py-3 px-4">Deskripsi / Genre</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {bands.length > 0 ? (
                  bands.map((band) => (
                    <tr key={band.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                        #{band.sortOrder}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden flex items-center justify-center text-[#9CA3AF]">
                          {band.photo ? (
                            <img src={band.photo} alt={band.name} className="w-full h-full object-cover" />
                          ) : (
                            <MusicNotes size={20} />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#111827]">{band.name}</td>
                      <td className="py-3 px-4 text-[#4B5563] max-w-sm truncate">
                        {band.description}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(band)}
                            className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151]"
                            title="Edit Band"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(band.id, band.name)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                            title="Hapus Band"
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
                      Belum ada band yang didaftarkan. Klik tombol Tambah Band untuk menambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#111827]">
                  {editingBand ? 'Edit Informasi Band' : 'Tambah Band Penampil'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">NAMA BAND *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Fosca Band"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">DESKRIPSI & GENRE</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat penampilan atau aransemen musik..."
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-[#374151] mb-1">URL FOTO POSTER</label>
                    <input
                      type="text"
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      placeholder="/images/band.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">NO. URUT</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Band'}
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
