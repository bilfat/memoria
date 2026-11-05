import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { participantRegistrationSchema } from '@/lib/validations';
import { processEmailJobsBatch } from '@/lib/brevo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validasi input registrasi
    const parsed = participantRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || 'Validasi formulir pendaftaran gagal.';
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstErrorMessage,
            fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const {
      ticketTypeId,
      fullName,
      nim,
      studyProgram,
      faculty,
      phone,
      email,
      idempotencyKey,
    } = parsed.data;

    // 2. Generate random tokens yang aman dan unik
    const qrToken = `mem_qr_${crypto.randomBytes(16).toString('hex')}`;
    const ticketAccessToken = `mem_tok_${crypto.randomBytes(16).toString('hex')}`;
    const effectiveIdempotencyKey =
      idempotencyKey || `idem_${crypto.randomBytes(16).toString('hex')}`;

    // 3. Panggil SQL RPC atomik register_participant
    const admin = createAdminClient();
    const { data: rpcResult, error: rpcError } = await admin.rpc('register_participant', {
      p_ticket_type_id: ticketTypeId,
      p_full_name: fullName,
      p_nim: nim,
      p_study_program: studyProgram,
      p_faculty: faculty,
      p_phone: phone,
      p_email: email,
      p_idempotency_key: effectiveIdempotencyKey,
      p_qr_token: qrToken,
      p_ticket_access_token: ticketAccessToken,
    });

    if (rpcError) {
      console.error('[API Registrations] RPC Error:', rpcError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Terjadi kesalahan sistem database saat mendaftarkan tiket.',
          },
        },
        { status: 500 }
      );
    }

    // 4. Periksa hasil logika bisnis dari RPC
    if (!rpcResult.success) {
      const errorCode = rpcResult.error || 'REGISTRATION_FAILED';
      const errorMessage = rpcResult.message || 'Pendaftaran tiket tidak dapat diproses.';

      let statusCode = 400;
      if (errorCode === 'DUPLICATE_NIM' || errorCode === 'TICKET_SOLD_OUT') {
        statusCode = 409;
      } else if (errorCode === 'TICKET_TYPE_NOT_FOUND') {
        statusCode = 404;
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
          },
        },
        { status: statusCode }
      );
    }

    // 5. Kirim email tiket secara instan di background worker
    processEmailJobsBatch().catch((err) => {
      console.error('[API Registrations] Trigger email jobs error:', err);
    });

    // 6. Sukses
    const ticketUrl = `/tiket/${rpcResult.ticketAccessToken}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          participantId: rpcResult.participantId,
          ticketNumber: rpcResult.ticketNumber,
          ticketAccessToken: rpcResult.ticketAccessToken,
          ticketUrl,
          isIdempotentReplay: Boolean(rpcResult.isIdempotentReplay),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API Registrations] Uncaught Exception:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Terjadi kesalahan internal pada server.',
        },
      },
      { status: 500 }
    );
  }
}

