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
    const qrToken = body.qrToken?.trim();
    const manualQuery = body.manualQuery?.trim();
    const manualType = body.manualType;

    const supabase = createAdminClient();

    // 1. RESOLUSI BERDASARKAN QR TOKEN (Pemindai Kamera atau Input Token)
    if (qrToken || manualType === 'TOKEN') {
      const token = (qrToken || manualQuery || '').trim();
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'BAD_REQUEST', message: 'Token QR tidak boleh kosong.' },
          { status: 400 }
        );
      }

      // Cari di tabel participants
      const { data: participant } = await supabase
        .from('participants')
        .select(`
          id, full_name, nim, study_program, faculty, status, ticket_number,
          ticket_types (id, name, is_active)
        `)
        .eq('qr_token', token)
        .maybeSingle();

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
        if (ticketType && ticketType.is_active === false) {
          return NextResponse.json(
            {
              success: false,
              error: 'TICKET_TYPE_INACTIVE',
              message: 'Kategori jenis tiket ini telah dinonaktifkan oleh panitia.',
            },
            { status: 400 }
          );
        }

        // Cek riwayat check-in
        const { data: existingCheckin } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(full_name)')
          .eq('participant_id', participant.id)
          .maybeSingle();

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn ? '' : signResolutionToken('PARTICIPANT', participant.id, staff.id);

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
            operatorName: (existingCheckin?.staff_profiles as any)?.full_name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      // Cari di tabel lecturer_invitations
      const { data: lecturer } = await supabase
        .from('lecturer_invitations')
        .select('id, full_name, email, phone, invitation_code, is_active')
        .eq('qr_token', token)
        .maybeSingle();

      if (lecturer) {
        if (!lecturer.is_active) {
          return NextResponse.json(
            {
              success: false,
              error: 'INVITATION_INACTIVE',
              message: 'Undangan dosen kehormatan ini telah dinonaktifkan.',
            },
            { status: 400 }
          );
        }

        const { data: existingCheckin } = await supabase
          .from('checkins')
          .select('id, checked_at, method, staff_profiles(full_name)')
          .eq('lecturer_id', lecturer.id)
          .maybeSingle();

        const isCheckedIn = !!existingCheckin;
        const resolutionToken = isCheckedIn ? '' : signResolutionToken('LECTURER', lecturer.id, staff.id);

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
            operatorName: (existingCheckin?.staff_profiles as any)?.full_name || 'Petugas Check-in',
            checkinMethod: existingCheckin?.method || null,
            canCheckIn: !isCheckedIn,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Kode QR tidak terdaftar dalam database peserta maupun undangan dosen.',
        },
        { status: 404 }
      );
    }

    // 2. RESOLUSI PENCARIAN MANUAL MAHASISWA (BERDASARKAN NIM)
    if (manualType === 'MAHASISWA') {
      if (!manualQuery) {
        return NextResponse.json(
          { success: false, error: 'BAD_REQUEST', message: 'NIM pencarian tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const { data: participant } = await supabase
        .from('participants')
        .select(`
          id, full_name, nim, study_program, faculty, status, ticket_number,
          ticket_types (id, name, is_active)
        `)
        .eq('nim', manualQuery)
        .maybeSingle();

      if (!participant) {
        return NextResponse.json(
          {
            success: false,
            error: 'NOT_FOUND',
            message: `Mahasiswa dengan NIM ${manualQuery} tidak ditemukan.`,
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
      if (ticketType && ticketType.is_active === false) {
        return NextResponse.json(
          {
            success: false,
            error: 'TICKET_TYPE_INACTIVE',
            message: 'Kategori tiket mahasiswa ini telah dinonaktifkan.',
          },
          { status: 400 }
        );
      }

      const { data: existingCheckin } = await supabase
        .from('checkins')
        .select('id, checked_at, method, staff_profiles(full_name)')
        .eq('participant_id', participant.id)
        .maybeSingle();

      const isCheckedIn = !!existingCheckin;
      const resolutionToken = isCheckedIn ? '' : signResolutionToken('PARTICIPANT', participant.id, staff.id);

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
          operatorName: (existingCheckin?.staff_profiles as any)?.full_name || 'Petugas Check-in',
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

      const isEmail = manualQuery.includes('@');
      let query = supabase.from('lecturer_invitations').select('id, full_name, email, phone, invitation_code, is_active');

      if (isEmail) {
        query = query.ilike('email', manualQuery.toLowerCase());
      } else {
        query = query.ilike('invitation_code', manualQuery);
      }

      const { data: lecturer } = await query.maybeSingle();

      if (!lecturer) {
        return NextResponse.json(
          {
            success: false,
            error: 'NOT_FOUND',
            message: `Undangan Dosen dengan identitas "${manualQuery}" tidak ditemukan.`,
          },
          { status: 404 }
        );
      }

      if (!lecturer.is_active) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVITATION_INACTIVE',
            message: 'Undangan dosen ini telah dinonaktifkan.',
          },
          { status: 400 }
        );
      }

      const { data: existingCheckin } = await supabase
        .from('checkins')
        .select('id, checked_at, method, staff_profiles(full_name)')
        .eq('lecturer_id', lecturer.id)
        .maybeSingle();

      const isCheckedIn = !!existingCheckin;
      const resolutionToken = isCheckedIn ? '' : signResolutionToken('LECTURER', lecturer.id, staff.id);

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
          operatorName: (existingCheckin?.staff_profiles as any)?.full_name || 'Petugas Check-in',
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
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: err.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}

