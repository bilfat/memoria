/**
 * MEMORIA Date & Time System (WIB / Asia/Jakarta UTC+7)
 * Single Source of Truth Utility for Formatting, Parsing, and Real-time Countdown.
 */

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  status: 'UPCOMING' | 'HAPPENING' | 'ENDED';
}

export interface WibDateTimeParts {
  date: string; // YYYY-MM-DD
  hour: string; // 00-23
  minute: string; // 00-59
  dayName: string; // Senin, Selasa, dst.
  formattedDate: string; // e.g. "20 November 2026"
  formattedTime: string; // e.g. "18:30 WIB"
  isoString: string;
}

/**
 * Format string ISO/UTC ke format lengkap WIB (e.g. "20 Nov 2026, 18:30 WIB")
 */
export function formatWibDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return (
      new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date) + ' WIB'
    );
  } catch {
    return isoString;
  }
}

/**
 * Format string ISO/UTC ke format hari & tanggal WIB (e.g. "Jumat, 20 November 2026")
 */
export function formatWibDateOnly(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format string ISO/UTC ke jam 24 jam WIB (e.g. "18:30 WIB")
 */
export function formatWibTimeOnly(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    const timeStr = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date).replace('.', ':');
    return `${timeStr} WIB`;
  } catch {
    return isoString;
  }
}

/**
 * Ekstraksi partisi waktu WIB dari string ISO untuk form input terkontrol
 */
export function formatIsoToWibParts(isoString?: string | null): WibDateTimeParts {
  const fallbackDate = '2026-11-20';
  const fallbackHour = '18';
  const fallbackMinute = '30';

  if (!isoString) {
    return {
      date: fallbackDate,
      hour: fallbackHour,
      minute: fallbackMinute,
      dayName: getWibDayName(fallbackDate),
      formattedDate: '20 November 2026',
      formattedTime: '18:30 WIB',
      isoString: '',
    };
  }

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) throw new Error('Invalid Date');

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const date = `${map.year}-${map.month}-${map.day}`;
    const hour = map.hour || '00';
    const minute = map.minute || '00';

    return {
      date,
      hour,
      minute,
      dayName: getWibDayName(date),
      formattedDate: formatWibDateOnly(isoString),
      formattedTime: `${hour}:${minute} WIB`,
      isoString,
    };
  } catch {
    return {
      date: fallbackDate,
      hour: fallbackHour,
      minute: fallbackMinute,
      dayName: getWibDayName(fallbackDate),
      formattedDate: '20 November 2026',
      formattedTime: '18:30 WIB',
      isoString,
    };
  }
}

/**
 * Konversi tanggal (YYYY-MM-DD) dan waktu 24 jam (HH:mm) Asia/Jakarta ke string UTC ISO resmi.
 */
export function parseWibToIso(dateStr: string, hourStr: string, minuteStr: string): string {
  const d = dateStr.trim();
  const h = hourStr.toString().padStart(2, '0');
  const m = minuteStr.toString().padStart(2, '0');
  const wibIsoString = `${d}T${h}:${m}:00+07:00`;
  const dateObj = new Date(wibIsoString);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Format tanggal atau waktu WIB tidak valid: ${wibIsoString}`);
  }
  return dateObj.toISOString();
}

/**
 * Mendapatkan nama hari bahasa Indonesia dari tanggal YYYY-MM-DD
 */
export function getWibDayName(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    // Append T12:00:00+07:00 to avoid midnight edge shifts
    const d = new Date(`${dateStr}T12:00:00+07:00`);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
    }).format(d);
  } catch {
    return '—';
  }
}

/**
 * Format string tanggal YYYY-MM-DD ke format baca Indonesia (e.g. "20 November 2026")
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(`${dateStr}T12:00:00+07:00`);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * calculateCountdown
 * Menghitung waktu mundur berdasarkan waktu nyata saat ini (Date.now()).
 * Tidak menggunakan tanggal server statis / mock.
 * Tidak pernah menghasilkan nilai negatif.
 */
export function calculateCountdown(targetIso: string, endIso?: string | null): CountdownTime {
  if (!targetIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, status: 'ENDED' };
  }

  const target = new Date(targetIso).getTime();
  if (isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, status: 'ENDED' };
  }

  const now = Date.now();
  const end = endIso ? new Date(endIso).getTime() : null;

  // Cek apakah acara sudah berakhir
  if (end && !isNaN(end) && now >= end) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, status: 'ENDED' };
  }

  // Cek apakah acara sedang berlangsung
  if (now >= target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, status: 'HAPPENING' };
  }

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false, status: 'UPCOMING' };
}

/**
 * Format string ISO/UTC menjadi format YYYY-MM-DDTHH:mm dalam zona waktu Asia/Jakarta (WIB)
 */
export function toWibInputString(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const parts = formatIsoToWibParts(isoString);
    return `${parts.date}T${parts.hour}:${parts.minute}`;
  } catch {
    return '';
  }
}
