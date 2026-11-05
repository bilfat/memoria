'use client';

import React, { useMemo } from 'react';
import {
  parseWibToIso,
  formatIsoToWibParts,
  getWibDayName,
  formatIndonesianDate,
} from '@/lib/date';
import { Calendar, Clock, GlobeHemisphereWest, CheckCircle } from '@phosphor-icons/react';

export interface DateTimePicker24Props {
  label: string;
  required?: boolean;
  valueIso?: string | null;
  onChangeIso: (isoString: string) => void;
  helperText?: string;
}

export function DateTimePicker24({
  label,
  required = false,
  valueIso,
  onChangeIso,
  helperText,
}: DateTimePicker24Props) {
  const parts = useMemo(() => {
    return formatIsoToWibParts(valueIso);
  }, [valueIso]);

  const hoursOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const minutesOptions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    try {
      const nextIso = parseWibToIso(newDate, parts.hour, parts.minute);
      onChangeIso(nextIso);
    } catch (e) {
      console.error(e);
    }
  };

  const handleHourChange = (newHour: string) => {
    try {
      const nextIso = parseWibToIso(parts.date, newHour, parts.minute);
      onChangeIso(nextIso);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    try {
      const nextIso = parseWibToIso(parts.date, parts.hour, newMinute);
      onChangeIso(nextIso);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#374151]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[10px] font-mono text-[#6B7280]">Format 24 Jam (WIB)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Date Picker Input (Calendar native) */}
        <div className="sm:col-span-7 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Calendar size={16} />
          </div>
          <input
            type="date"
            required={required}
            value={parts.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D1D5DB] text-xs font-mono focus:outline-none focus:border-[#891523] bg-white cursor-pointer"
          />
        </div>

        {/* 24-Hour Time Selectors (No AM/PM) */}
        <div className="sm:col-span-5 flex items-center gap-1.5">
          <div className="relative flex-1">
            <select
              value={parts.hour}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-full py-2 px-2 text-center rounded-lg border border-[#D1D5DB] text-xs font-mono font-bold focus:outline-none focus:border-[#891523] bg-white cursor-pointer"
              title="Pilih Jam (00 - 23)"
            >
              {hoursOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <span className="font-bold text-neutral-400 text-sm">:</span>

          <div className="relative flex-1">
            <select
              value={parts.minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="w-full py-2 px-2 text-center rounded-lg border border-[#D1D5DB] text-xs font-mono font-bold focus:outline-none focus:border-[#891523] bg-white cursor-pointer"
              title="Pilih Menit (00 - 59)"
            >
              {minutesOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] font-bold text-[#891523] bg-[#FAEDEF] px-2 py-2 rounded-lg shrink-0">
            WIB
          </span>
        </div>
      </div>

      {helperText && <p className="text-[10px] text-[#6B7280]">{helperText}</p>}
    </div>
  );
}

/**
 * EventSchedulePreviewBox
 * Menampilkan ringkasan jadwal acara terhitung otomatis secara realtime.
 */
export function EventSchedulePreviewBox({
  startIso,
}: {
  startIso: string;
  endIso?: string | null;
}) {
  const startParts = useMemo(() => formatIsoToWibParts(startIso), [startIso]);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAEDEF]/50 via-white to-[#F9FAFB] border border-[#891523]/20 shadow-xs space-y-2.5">
      <div className="flex items-center gap-2 border-b border-[#891523]/10 pb-2">
        <CheckCircle size={16} weight="fill" className="text-[#891523]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#891523]">
          Ringkasan Jadwal Terverifikasi (WIB)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">HARI</span>
          <span className="font-bold text-[#111827]">{startParts.dayName}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">TANGGAL</span>
          <span className="font-bold text-[#111827]">{formatIndonesianDate(startParts.date)}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">WAKTU ACARA</span>
          <span className="font-bold text-[#891523] font-mono">{startParts.hour}:{startParts.minute} WIB</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#6B7280] border-t border-[#891523]/10">
        <GlobeHemisphereWest size={13} className="text-[#891523]" />
        <span>Zona Waktu Resmi: <strong>Asia/Jakarta (UTC+7)</strong>. Dihitung otomatis tanpa input manual.</span>
      </div>
    </div>
  );
}

