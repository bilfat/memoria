import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyResolutionToken } from '@/lib/checkinCrypto';

interface ConfirmRequestBody {
  resolutionToken: string;
  method?: string; // 'CAMERA_QR' | 'MANUAL' | 'qr' | 'manual'
}

/**
 * POST /api/checkins/confirm
 * Mengonfirmasi kehadiran tamu secara atomik via SQL RPC `confirm_checkin`.
 * Mencegah duplikasi, race condition, dan menjamin timestamp konsisten dari DB.
 */
export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaffSession();
    if (!staff || (staff.role !== 'ADMIN_PANITIA' && staff.role !== 'PETUGAS_CHECKIN')) {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Hanya panitia yang berwenang melakukan konfirmasi check-in.',
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as ConfirmRequestBody;
    const { resolutionToken, method = 'CAMERA_QR' } = body;

    if (!resolutionToken) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'Resolution token wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Validasi HMAC signature, expiration token, dan kepemilikan sesi petugas
    const tokenVerification = verifyResolutionToken(resolutionToken, staff.id);
    if (!tokenVerification.valid || !tokenVerification.targetType || !tokenVerification.targetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_RESOLUTION_TOKEN',
          message: tokenVerification.error || 'Token resolusi tidak sah atau telah kedaluwarsa.',
        },
        { status: 400 }
      );
    }

    // 2. Normalisasi method check-in agar strictly 'qr' atau 'manual'
    const normalizedMethod: 'qr' | 'manual' = method.toLowerCase().includes('qr')
      ? 'qr'
      : 'manual';

    const supabase = createAdminClient();

    // 3. Panggil SQL RPC atomik confirm_checkin
    const { data: rpcResult, error: rpcError } = await supabase.rpc('confirm_checkin', {
      p_target_type: tokenVerification.targetType,
      p_target_id: tokenVerification.targetId,
      p_method: normalizedMethod,
      p_staff_id: staff.id,
    });

    if (rpcError) {
      console.error('[checkins/confirm] RPC Execution Error:', rpcError);
      return NextResponse.json(
        {
          success: false,
          error: 'RPC_EXECUTION_FAILED',
          message: rpcError.message || 'Gagal mengeksekusi presensi di database.',
        },
        { status: 500 }
      );
    }

    if (!rpcResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rpcResult.error || 'CHECKIN_REJECTED',
          message: rpcResult.message || 'Presensi ditolak oleh sistem.',
        },
        { status: 400 }
      );
    }

    // 4. Catat ke audit_logs
    await supabase.from('audit_logs').insert({
      actor_id: staff.id,
      action: rpcResult.outcome === 'CREATED' ? 'CHECKIN_CONFIRM_SUCCESS' : 'CHECKIN_ALREADY_RECORDED',
      entity_type: tokenVerification.targetType === 'PARTICIPANT' ? 'participants' : 'lecturer_invitations',
      entity_id: tokenVerification.targetId,
      details: {
        outcome: rpcResult.outcome,
        method: normalizedMethod,
        operatorName: staff.fullName,
        checkedAt: rpcResult.checkedAt,
        attendeeName: rpcResult.name,
      },
    });

    // 5. Respons outcome resmi
    return NextResponse.json({
      success: true,
      outcome: rpcResult.outcome, // 'CREATED' atau 'ALREADY_CHECKED_IN'
      checkedAt: rpcResult.checkedAt,
      name: rpcResult.name,
      ticketName: rpcResult.ticketName || null,
      targetType: tokenVerification.targetType,
      operatorName: staff.fullName,
    });
  } catch (err: any) {
    console.error('[checkins/confirm] Unexpected exception:', err);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: err.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
