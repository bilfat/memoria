'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from './auth';

export interface CheckinHistoryItem {
  id: string;
  checkedAt: string;
  method: string;
  subjectType: 'MAHASISWA' | 'DOSEN';
  subjectName: string;
  subjectIdentifier: string;
  ticketName: string;
  operatorName: string;
}

export interface CheckinStats {
  totalCount: number;
  studentCount: number;
  lecturerCount: number;
}

/**
 * getCheckinHistoryAction
 * Mengambil riwayat check-in langsung dari database Supabase PostgreSQL dengan pagination/limit.
 */
export async function getCheckinHistoryAction(params?: {
  filterType?: 'ALL' | 'MAHASISWA' | 'DOSEN';
  search?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  records: CheckinHistoryItem[];
  stats: CheckinStats;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaffSession();
    if (!staff) {
      return {
        success: false,
        records: [],
        stats: { totalCount: 0, studentCount: 0, lecturerCount: 0 },
        error: 'Sesi panitia tidak valid.',
      };
    }

    const supabase = createAdminClient();

    // Query riwayat check-in terbaru
    const { data: rawCheckins, error: checkinError } = await supabase
      .from('checkins')
      .select(`
        id, checked_at, method,
        staff_profiles (*),
        participants (
          id, full_name, nim, study_program, faculty,
          ticket_types (name)
        ),
        lecturer_invitations (
          id, full_name, email, invitation_code
        )
      `)
      .order('checked_at', { ascending: false })
      .limit(params?.limit || 200);

    if (checkinError) {
      return {
        success: false,
        records: [],
        stats: { totalCount: 0, studentCount: 0, lecturerCount: 0 },
        error: checkinError.message,
      };
    }

    let studentCount = 0;
    let lecturerCount = 0;

    const formattedRecords: CheckinHistoryItem[] = (rawCheckins || []).map((row: any) => {
      const isParticipant = !!row.participants;
      if (isParticipant) {
        studentCount++;
      } else {
        lecturerCount++;
      }

      const participant = row.participants;
      const lecturer = row.lecturer_invitations;
      const staffName = row.staff_profiles?.name || row.staff_profiles?.full_name || 'Petugas Check-in';

      if (isParticipant && participant) {
        return {
          id: row.id,
          checkedAt: row.checked_at,
          method: row.method || 'QR',
          subjectType: 'MAHASISWA',
          subjectName: participant.full_name || '-',
          subjectIdentifier: participant.nim || '-',
          ticketName: participant.ticket_types?.name || 'Tiket Regular',
          operatorName: staffName,
        };
      } else if (lecturer) {
        return {
          id: row.id,
          checkedAt: row.checked_at,
          method: row.method || 'QR',
          subjectType: 'DOSEN',
          subjectName: lecturer.full_name || '-',
          subjectIdentifier: lecturer.invitation_code || lecturer.email || '-',
          ticketName: 'Undangan Dosen Kehormatan',
          operatorName: staffName,
        };
      }

      return {
        id: row.id,
        checkedAt: row.checked_at,
        method: row.method || 'MANUAL',
        subjectType: 'MAHASISWA',
        subjectName: 'Tamu Terdaftar',
        subjectIdentifier: '-',
        ticketName: '-',
        operatorName: staffName,
      };
    });

    // Ambil total agregat presensi
    const { count: totalCheckins } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true });

    const { count: studentCheckins } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .not('participant_id', 'is', null);

    const { count: lecturerCheckins } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .not('lecturer_id', 'is', null);

    const stats: CheckinStats = {
      totalCount: totalCheckins || formattedRecords.length,
      studentCount: studentCheckins ?? studentCount,
      lecturerCount: lecturerCheckins ?? lecturerCount,
    };

    // Filter in-memory jika ada parameter filter
    let result = formattedRecords;
    if (params?.filterType && params.filterType !== 'ALL') {
      result = result.filter((r) => r.subjectType === params.filterType);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.subjectName.toLowerCase().includes(q) ||
          r.subjectIdentifier.toLowerCase().includes(q) ||
          r.operatorName.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      records: result,
      stats,
    };
  } catch (err: any) {
    return {
      success: false,
      records: [],
      stats: { totalCount: 0, studentCount: 0, lecturerCount: 0 },
      error: err.message || 'Gagal memuat riwayat check-in.',
    };
  }
}

