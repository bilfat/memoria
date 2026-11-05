'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from './auth';

export interface RecentCheckinFeedItem {
  id: string;
  subjectName: string;
  subjectIdentifier: string;
  subjectType: 'MAHASISWA' | 'DOSEN';
  method: string;
  checkedInAt: string;
  operatorName: string;
}

export interface DashboardMetrics {
  totalActiveParticipants: number;
  presentParticipants: number;
  uncheckinParticipants: number;
  publishedTickets: number;
  totalQuota: number;
  usedQuota: number;
  hasUnlimitedTickets: boolean;
  totalLecturers: number;
  presentLecturers: number;
  totalVenueCheckins: number;
  recentCheckins: RecentCheckinFeedItem[];
}

/**
 * getDashboardMetricsAction
 * Mengambil metrik agregat langsung dari tabel-tabel Supabase PostgreSQL.
 * Mengembalikan data riil tanpa mock-zero fallback pada database error.
 */
export async function getDashboardMetricsAction(): Promise<{
  success: boolean;
  metrics: DashboardMetrics | null;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaffSession();
    if (!staff || staff.role !== 'ADMIN_PANITIA') {
      return {
        success: false,
        metrics: null,
        error: 'Hanya Admin Panitia yang berhak melihat metrik dashboard.',
      };
    }

    const supabase = createAdminClient();

    // 1. Peserta Aktif
    const { count: activeParticipantsCount, error: partErr } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (partErr) {
      return { success: false, metrics: null, error: `Gagal memuat peserta: ${partErr.message}` };
    }

    // 2. Checkins Mahasiswa Hadir (Hanya peserta yang berstatus aktif)
    const { count: presentParticipantsCount, error: presPartErr } = await supabase
      .from('checkins')
      .select('id, participants!inner(status)', { count: 'exact', head: true })
      .eq('participants.status', 'active');

    if (presPartErr) {
      return { success: false, metrics: null, error: `Gagal memuat presensi mahasiswa: ${presPartErr.message}` };
    }

    // 3. Dosen Aktif & Hadir (Hanya undangan yang berstatus is_active = true)
    const { count: activeLecturersCount, error: lecErr } = await supabase
      .from('lecturer_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (lecErr) {
      return { success: false, metrics: null, error: `Gagal memuat undangan dosen: ${lecErr.message}` };
    }

    const { count: presentLecturersCount, error: presLecErr } = await supabase
      .from('checkins')
      .select('id, lecturer_invitations!inner(is_active)', { count: 'exact', head: true })
      .eq('lecturer_invitations.is_active', true);

    if (presLecErr) {
      return { success: false, metrics: null, error: `Gagal memuat presensi dosen: ${presLecErr.message}` };
    }

    // 4. Total Hadir Keseluruhan di Venue (Semua check-in historis)
    const { count: totalCheckinsCount, error: checkinErr } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true });

    if (checkinErr) {
      return { success: false, metrics: null, error: `Gagal memuat total kehadiran venue: ${checkinErr.message}` };
    }

    // 5. Tiket Published & Kapasitas Kuota
    const { data: ticketTypes, error: ttErr } = await supabase
      .from('ticket_types')
      .select('id, capacity, status');

    if (ttErr) {
      return { success: false, metrics: null, error: `Gagal memuat kategori tiket: ${ttErr.message}` };
    }

    const publishedList = (ticketTypes || []).filter((t) => t.status === 'published');
    let totalCap = 0;
    let hasUnlimited = false;

    publishedList.forEach((t) => {
      if (t.capacity !== null && t.capacity !== undefined) {
        totalCap += t.capacity;
      } else {
        hasUnlimited = true;
      }
    });

    // 6. Lima Riwayat Check-in Terkini
    const { data: rawRecent, error: recentErr } = await supabase
      .from('checkins')
      .select(`
        id, checked_at, method,
        staff_profiles (*),
        participants (full_name, nim),
        lecturer_invitations (full_name, invitation_code)
      `)
      .order('checked_at', { ascending: false })
      .limit(5);

    if (recentErr) {
      return { success: false, metrics: null, error: `Gagal memuat riwayat check-in terkini: ${recentErr.message}` };
    }

    const recentCheckins: RecentCheckinFeedItem[] = (rawRecent || []).map((row: any) => {
      const isPart = !!row.participants;
      const part = row.participants;
      const lec = row.lecturer_invitations;
      const staffName = row.staff_profiles?.name || row.staff_profiles?.full_name || 'Petugas Check-in';

      if (isPart && part) {
        return {
          id: row.id,
          subjectName: part.full_name,
          subjectIdentifier: part.nim,
          subjectType: 'MAHASISWA',
          method: row.method || 'QR',
          checkedInAt: row.checked_at,
          operatorName: staffName,
        };
      } else if (lec) {
        return {
          id: row.id,
          subjectName: lec.full_name,
          subjectIdentifier: lec.invitation_code || 'VIP',
          subjectType: 'DOSEN',
          method: row.method || 'QR',
          checkedInAt: row.checked_at,
          operatorName: staffName,
        };
      }

      return {
        id: row.id,
        subjectName: 'Tamu Terdaftar',
        subjectIdentifier: '-',
        subjectType: 'MAHASISWA',
        method: row.method || 'MANUAL',
        checkedInAt: row.checked_at,
        operatorName: staffName,
      };
    });

    const activeParticipants = activeParticipantsCount || 0;
    const presentParticipants = presentParticipantsCount || 0;
    const uncheckin = Math.max(0, activeParticipants - presentParticipants);

    return {
      success: true,
      metrics: {
        totalActiveParticipants: activeParticipants,
        presentParticipants,
        uncheckinParticipants: uncheckin,
        publishedTickets: publishedList.length,
        totalQuota: totalCap,
        usedQuota: activeParticipants,
        hasUnlimitedTickets: hasUnlimited,
        totalLecturers: activeLecturersCount || 0,
        presentLecturers: presentLecturersCount || 0,
        totalVenueCheckins: totalCheckinsCount || 0,
        recentCheckins,
      },
    };
  } catch (err: any) {
    console.error('[getDashboardMetricsAction] Exception:', err);
    return {
      success: false,
      metrics: null,
      error: err.message || 'Terjadi kesalahan sistem saat memuat metrik.',
    };
  }
}
