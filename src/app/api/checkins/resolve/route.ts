import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { signResolutionToken, maskIdentifier } from '@/lib/checkinCrypto';

interface ResolveRequestBody {
  qrToken?: string;
  manualType?: 'MAHASISWA' | 'DOSEN' | 'TOKEN';
  manualQuery?: string;
}

/**
 * Normalisasi token QR hasil scan (mendukung token langsung atau format URL resmi MEMORIA)
 */
function extractCleanQrToken(input: string): string {
  let clean = input.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      const queryToken =
        url.searchParams.get('token') ||
        url.searchParams.get('qr') ||
        url.searchParams.get('code') ||
        url.searchParams.get('t');
      if (queryToken && queryToken.trim()) {
        return queryToken.trim();
      }
      const parts = url.pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        return lastPart.trim();
      }
    } catch {
      // Abaikan jika parsing URL gagal
    }
  }
  return clean;
}

/**
 * POST /api/checkins/resolve
 * Endpoint resolusi identitas calon tamu (Mahasiswa / Dosen) sebelum konfirmasi presensi.
 * Menghasilkan resolutionToken terenkripsi jika tamu sah dan belum check-in.
 */
export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaffSession();
    if (!staff || (staff.role !== 'ADMIN_PANITIA' && staff.role !== 'PETUGAS_CHECKIN')) {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Hanya panitia yang berwenang melakukan presensi meja registrasi.',
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as ResolveRequestBody;
    const rawQr = body.qrToken?.trim();
    const manualQuery = body.manualQuery?.trim();
    const manualType = body.manualType;

    const supabase = createAdminClient();

    // 1. RESOLUSI BERDASARKAN QR TOKEN (Pemindai Kamera atau Input Token)
    if (rawQr || manualType === 'TOKEN') {
      const token = extractCleanQrToken(rawQr || manualQuery || '');
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'BAD_REQUEST', message: 'Token QR tidak boleh kosong.' },
          { status: 400 }
        );
      }

      // 1A. Cari di tabel participants berdasarkan qr_token
      const { data: participant, error: partError } = await supabase
        .from('participants')
        .select(`
          id, full_name, nim, study_program, faculty, status, ticket_number,
          ticket_types (id, name, status)
        `)
        .eq('qr_token', token)
        .maybeSingle();

      if (partError) {
        console.error('[checkins/resolve] Error query participants (qr_token):', partError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Terjadi kegagalan koneksi database saat memverifikasi tiket mahasiswa.',
          },
          { status: 500 }
        );
      }

      if (participant) {
        if (participant.status !== 'active') {
          return NextResponse.json(
            {
              success: false,
              error: 'TICKET_ARCHIVED',
              message: 'Tiket mahasiswa ini telah diarsipkan dan tidak dapat digunakan.',
            },
            { status: 400 }
          );
        }

        const ticketType = participant.ticket_types as any;

        // Cek riwayat check-in (kolom name di staff_profiles)
        const { data: existingCheckin, error: checkinError } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(name)')
          .eq('participant_id', participant.id)
          .maybeSingle();

        if (checkinError) {
          console.error('[checkins/resolve] Error query checkins for participant:', checkinError);
          return NextResponse.json(
            {
              success: false,
              error: 'DATABASE_QUERY_FAILED',
              message: 'Gagal memeriksa riwayat kehadiran peserta.',
            },
            { status: 500 }
          );
        }

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn
          ? ''
          : signResolutionToken('PARTICIPANT', participant.id, staff.id);

        return NextResponse.json({
          success: true,
          resolutionToken,
          attendee: {
            targetType: 'PARTICIPANT' as const,
            id: participant.id,
            name: participant.full_name,
            identifier: participant.nim,
            identifierMasked: maskIdentifier(participant.nim, false),
            subtext: `${participant.study_program} — ${participant.faculty}`,
            ticketName: ticketType?.name || 'Tiket Regular',
            isCheckedIn,
            firstCheckedInAt: existingCheckin?.checked_at || null,
            operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      // 1B. Cari di tabel lecturer_invitations berdasarkan qr_token
      const { data: lecturer, error: lecError } = await supabase
        .from('lecturer_invitations')
        .select('id, full_name, email, phone, invitation_code, is_active')
        .eq('qr_token', token)
        .maybeSingle();

      if (lecError) {
        console.error('[checkins/resolve] Error query lecturer_invitations (qr_token):', lecError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Terjadi kegagalan koneksi database saat memverifikasi undangan dosen.',
          },
          { status: 500 }
        );
      }

      if (lecturer) {
        if (!lecturer.is_active) {
          return NextResponse.json(
            {
              success: false,
              error: 'INVITATION_INACTIVE',
              message: 'Undangan dosen kehormatan ini telah dinonaktifkan oleh panitia.',
            },
            { status: 400 }
          );
        }

        const { data: existingCheckin, error: lecCheckinError } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(name)')
          .eq('lecturer_id', lecturer.id)
          .maybeSingle();

        if (lecCheckinError) {
          console.error('[checkins/resolve] Error query checkins for lecturer:', lecCheckinError);
          return NextResponse.json(
            {
              success: false,
              error: 'DATABASE_QUERY_FAILED',
              message: 'Gagal memeriksa riwayat kehadiran dosen.',
            },
            { status: 500 }
          );
        }

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn
          ? ''
          : signResolutionToken('LECTURER', lecturer.id, staff.id);

        return NextResponse.json({
          success: true,
          resolutionToken,
          attendee: {
            targetType: 'LECTURER' as const,
            id: lecturer.id,
            name: lecturer.full_name,
            identifier: lecturer.invitation_code,
            identifierMasked: lecturer.email ? maskIdentifier(lecturer.email, true) : lecturer.invitation_code,
            subtext: `Tamu VIP Dosen • ${lecturer.invitation_code}`,
            ticketName: 'Undangan Dosen Kehormatan',
            isCheckedIn,
            firstCheckedInAt: existingCheckin?.checked_at || null,
            operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      // 1C. Fallback Kompatibilitas: jika scan URL atau access token lama
      const { data: partByToken } = await supabase
        .from('participants')
        .select(`
          id, full_name, nim, study_program, faculty, status, ticket_number,
          ticket_types (id, name, status)
        `)
        .eq('ticket_access_token', token)
        .maybeSingle();

      if (partByToken) {
        if (partByToken.status !== 'active') {
          return NextResponse.json(
            {
              success: false,
              error: 'TICKET_ARCHIVED',
              message: 'Tiket mahasiswa ini telah diarsipkan dan tidak dapat digunakan.',
            },
            { status: 400 }
          );
        }

        const { data: existingCheckin } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(name)')
          .eq('participant_id', partByToken.id)
          .maybeSingle();

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn
          ? ''
          : signResolutionToken('PARTICIPANT', partByToken.id, staff.id);

        return NextResponse.json({
          success: true,
          resolutionToken,
          attendee: {
            targetType: 'PARTICIPANT' as const,
            id: partByToken.id,
            name: partByToken.full_name,
            identifier: partByToken.nim,
            identifierMasked: maskIdentifier(partByToken.nim, false),
            subtext: `${partByToken.study_program} — ${partByToken.faculty}`,
            ticketName: (partByToken.ticket_types as any)?.name || 'Tiket Regular',
            isCheckedIn,
            firstCheckedInAt: existingCheckin?.checked_at || null,
            operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      // 1D. Fallback Kompatibilitas Dosen: jika scan public_token atau kode undangan
      const { data: lecByToken } = await supabase
        .from('lecturer_invitations')
        .select('id, full_name, email, phone, invitation_code, is_active')
        .or(`public_token.eq.${token},invitation_code.ilike.${token}`)
        .maybeSingle();

      if (lecByToken) {
        if (!lecByToken.is_active) {
          return NextResponse.json(
            {
              success: false,
              error: 'INVITATION_INACTIVE',
              message: 'Undangan dosen kehormatan ini telah dinonaktifkan oleh panitia.',
            },
            { status: 400 }
          );
        }

        const { data: existingCheckin } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(name)')
          .eq('lecturer_id', lecByToken.id)
          .maybeSingle();

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn
          ? ''
          : signResolutionToken('LECTURER', lecByToken.id, staff.id);

        return NextResponse.json({
          success: true,
          resolutionToken,
          attendee: {
            targetType: 'LECTURER' as const,
            id: lecByToken.id,
            name: lecByToken.full_name,
            identifier: lecByToken.invitation_code,
            identifierMasked: lecByToken.email ? maskIdentifier(lecByToken.email, true) : lecByToken.invitation_code,
            subtext: `Tamu VIP Dosen • ${lecByToken.invitation_code}`,
            ticketName: 'Undangan Dosen Kehormatan',
            isCheckedIn,
            firstCheckedInAt: existingCheckin?.checked_at || null,
            operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'QR_NOT_FOUND',
          message: 'Kode QR tidak terdaftar dalam database peserta maupun undangan dosen.',
        },
        { status: 404 }
      );
    }

    // 2. RESOLUSI PENCARIAN MANUAL MAHASISWA (BERDASARKAN NIM ATAU NOMOR TIKET)
    if (manualType === 'MAHASISWA') {
      if (!manualQuery) {
        return NextResponse.json(
          { success: false, error: 'BAD_REQUEST', message: 'NIM atau nomor tiket pencarian tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const cleanQuery = manualQuery.trim();
      const { data: participant, error: partError } = await supabase
        .from('participants')
        .select(`
          id, full_name, nim, study_program, faculty, status, ticket_number,
          ticket_types (id, name, status)
        `)
        .or(`nim.ilike.${cleanQuery},ticket_number.ilike.${cleanQuery}`)
        .maybeSingle();

      if (partError) {
        console.error('[checkins/resolve] Error query participants (manual):', partError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Terjadi kegagalan koneksi database saat mencari data mahasiswa.',
          },
          { status: 500 }
        );
      }

      if (!participant) {
        return NextResponse.json(
          {
            success: false,
            error: 'NOT_FOUND',
            message: `Mahasiswa dengan identitas "${cleanQuery}" tidak ditemukan.`,
          },
          { status: 404 }
        );
      }

      if (participant.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            error: 'TICKET_ARCHIVED',
            message: 'Tiket mahasiswa ini telah diarsipkan dan tidak dapat digunakan.',
          },
          { status: 400 }
        );
      }

      const ticketType = participant.ticket_types as any;

      const { data: existingCheckin, error: checkinError } = await supabase
        .from('checkins')
        .select('id, checked_at, method, staff_profiles(name)')
        .eq('participant_id', participant.id)
        .maybeSingle();

      if (checkinError) {
        console.error('[checkins/resolve] Error query checkins for manual participant:', checkinError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Gagal memeriksa riwayat kehadiran peserta.',
          },
          { status: 500 }
        );
      }

      const isCheckedIn = !!existingCheckin;
      const resolutionToken = isCheckedIn
        ? ''
        : signResolutionToken('PARTICIPANT', participant.id, staff.id);

      return NextResponse.json({
        success: true,
        resolutionToken,
        attendee: {
          targetType: 'PARTICIPANT' as const,
          id: participant.id,
          name: participant.full_name,
          identifier: participant.nim,
          identifierMasked: maskIdentifier(participant.nim, false),
          subtext: `${participant.study_program} — ${participant.faculty}`,
          ticketName: ticketType?.name || 'Tiket Regular',
          isCheckedIn,
          firstCheckedInAt: existingCheckin?.checked_at || null,
          operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
          checkinMethod: existingCheckin?.method || null,
          canCheckIn: !isCheckedIn,
        },
      });
    }

    // 3. RESOLUSI PENCARIAN MANUAL DOSEN (BERDASARKAN EMAIL ATAU KODE UNDANGAN)
    if (manualType === 'DOSEN') {
      if (!manualQuery) {
        return NextResponse.json(
          { success: false, error: 'BAD_REQUEST', message: 'Email atau kode undangan tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const cleanQuery = manualQuery.trim();
      const isEmail = cleanQuery.includes('@');
      let query = supabase.from('lecturer_invitations').select('id, full_name, email, phone, invitation_code, is_active');

      if (isEmail) {
        query = query.ilike('email', cleanQuery.toLowerCase());
      } else {
        query = query.or(`invitation_code.ilike.${cleanQuery},full_name.ilike.%${cleanQuery}%`);
      }

      const { data: lecturer, error: lecError } = await query.maybeSingle();

      if (lecError) {
        console.error('[checkins/resolve] Error query lecturer_invitations (manual):', lecError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Terjadi kegagalan koneksi database saat mencari data dosen.',
          },
          { status: 500 }
        );
      }

      if (!lecturer) {
        return NextResponse.json(
          {
            success: false,
            error: 'NOT_FOUND',
            message: `Undangan Dosen dengan identitas "${cleanQuery}" tidak ditemukan.`,
          },
          { status: 404 }
        );
      }

      if (!lecturer.is_active) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVITATION_INACTIVE',
            message: 'Undangan dosen ini telah dinonaktifkan oleh panitia.',
          },
          { status: 400 }
        );
      }

      const { data: existingCheckin, error: lecCheckinError } = await supabase
        .from('checkins')
        .select('id, checked_at, method, staff_profiles(name)')
        .eq('lecturer_id', lecturer.id)
        .maybeSingle();

      if (lecCheckinError) {
        console.error('[checkins/resolve] Error query checkins for manual lecturer:', lecCheckinError);
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_QUERY_FAILED',
            message: 'Gagal memeriksa riwayat kehadiran dosen.',
          },
          { status: 500 }
        );
      }

      const isCheckedIn = !!existingCheckin;
      const resolutionToken = isCheckedIn
        ? ''
        : signResolutionToken('LECTURER', lecturer.id, staff.id);

      return NextResponse.json({
        success: true,
        resolutionToken,
        attendee: {
          targetType: 'LECTURER' as const,
          id: lecturer.id,
          name: lecturer.full_name,
          identifier: lecturer.invitation_code,
          identifierMasked: lecturer.email ? maskIdentifier(lecturer.email, true) : lecturer.invitation_code,
          subtext: `Tamu VIP Dosen • ${lecturer.invitation_code}`,
          ticketName: 'Undangan Dosen Kehormatan',
          isCheckedIn,
          firstCheckedInAt: existingCheckin?.checked_at || null,
          operatorName: (existingCheckin?.staff_profiles as any)?.name || 'Petugas Check-in',
          checkinMethod: existingCheckin?.method || null,
          canCheckIn: !isCheckedIn,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'BAD_REQUEST', message: 'Parameter pencarian tidak lengkap.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[checkins/resolve] Unexpected exception:', err);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: err.message || 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
