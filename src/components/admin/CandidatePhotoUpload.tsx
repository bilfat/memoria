'use client';

import React, { useRef } from 'react';
import { UploadSimple, Trash, Image as ImageIcon, Sparkle } from '@phosphor-icons/react';

interface CandidatePhotoUploadProps {
  photo?: string;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CandidatePhotoUpload({
  photo,
  onChange,
  onRemove,
  disabled = false,
}: CandidatePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-[#4B5563]">
        FOTO KANDIDAT (PNG / JPG / WEBP)
      </label>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {photo ? (
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#D1D5DB]">
          {/* Thumbnail Preview */}
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-[#E5E7EB] shrink-0 flex items-center justify-center relative group">
            <img
              src={photo}
              alt="Preview Kandidat"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
              <Sparkle size={12} weight="fill" className="text-emerald-600" />
              <span>Foto Terpasang</span>
            </span>
            <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
              Siap ditampilkan di panggung voting
            </p>
          </div>

          {!disabled && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleTriggerClick}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#891523] bg-[#FAEDEF] hover:bg-[#F3D5D9] rounded-md transition-colors"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                title="Hapus Foto"
              >
                <Trash size={15} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={disabled}
          className="w-full p-3 rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#891523] hover:bg-[#FAEDEF]/40 bg-white flex items-center justify-center gap-2 text-xs text-[#6B7280] hover:text-[#891523] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          <UploadSimple size={16} className="text-[#9CA3AF] group-hover:text-[#891523]" />
          <span className="font-medium">Unggah File Foto Kandidat</span>
        </button>
      )}
    </div>
  );
}

