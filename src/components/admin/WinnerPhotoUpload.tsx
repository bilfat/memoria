'use client';

import React, { useRef } from 'react';
import { UploadSimple, Trash, Image as ImageIcon, Sparkle } from '@phosphor-icons/react';

interface WinnerPhotoUploadProps {
  photo?: string;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function WinnerPhotoUpload({
  photo,
  onChange,
  onRemove,
  disabled = false,
}: WinnerPhotoUploadProps) {
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
        FOTO PEMENANG (UPLOAD FILE ATAU URL)
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex items-start gap-4 p-3 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
        {/* Preview Container */}
        <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-[#E5E7EB] bg-white flex items-center justify-center shrink-0 shadow-xs">
          {photo ? (
            <img
              src={photo}
              alt="Preview Pemenang"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 gap-1 p-2 text-center">
              <ImageIcon size={24} />
              <span className="text-[9px] leading-tight">Belum ada foto</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerClick}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#891523] text-white hover:bg-[#6b101b] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UploadSimple size={14} weight="bold" />
              <span>{photo ? 'Ganti File Foto' : 'Upload File Foto'}</span>
            </button>

            {photo && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash size={13} />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#6B7280]">
            Format JPG, PNG, atau WebP (Maks 5MB). Foto akan otomatis disimpan ke database mock.
          </div>

          {/* Alternative URL Input */}
          <div className="pt-1">
            <input
              type="text"
              value={photo || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Atau tempel URL gambar (/images/award.jpg)..."
              disabled={disabled}
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

