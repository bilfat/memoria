export type TicketAdminStatus = 'draft' | 'published' | 'archived';
export type TicketDerivedStatus = 'upcoming' | 'open' | 'sold_out' | 'closed';

/**
 * Konversi string waktu dari form datetime-local atau ISO ke ISO String UTC dengan offset Asia/Jakarta (+07:00)
 */
export function normalizeWibToUtcIso(dateTimeStr: string): string {
  const trimmed = dateTimeStr.trim();
  if (trimmed.includes('+') || trimmed.endsWith('Z')) {
    return new Date(trimmed).toISOString();
  }
  // Format datetime-local: YYYY-MM-DDTHH:mm atau YYYY-MM-DDTHH:mm:ss
  const withSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return new Date(`${withSeconds}+07:00`).toISOString();
}

/**
 * Hitung status publik secara dinamis berdasarkan waktu server saat ini,
 * status publikasi admin, periode registrasi, dan kuota aktif.
 */
export function computeDerivedStatus(
  ticket: {
    status: TicketAdminStatus;
    registration_open_at: string;
    registration_close_at: string;
    capacity: number | null;
  },
  activeCount: number,
  now: Date = new Date()
): { status: TicketDerivedStatus; label: string; isAvailable: boolean } {
  if (ticket.status !== 'published') {
    return {
      status: 'closed',
      label: ticket.status === 'draft' ? 'Draft' : 'Diarsipkan',
      isAvailable: false,
    };
  }

  const openTime = new Date(ticket.registration_open_at);
  const closeTime = new Date(ticket.registration_close_at);

  if (now < openTime) {
    return {
      status: 'upcoming',
      label: 'Belum Dibuka',
      isAvailable: false,
    };
  }

  if (now > closeTime) {
    return {
      status: 'closed',
      label: 'Ditutup',
      isAvailable: false,
    };
  }

  if (ticket.capacity !== null && activeCount >= ticket.capacity) {
    return {
      status: 'sold_out',
      label: 'Habis (Sold Out)',
      isAvailable: false,
    };
  }

  return {
    status: 'open',
    label: 'Tersedia',
    isAvailable: true,
  };
}
