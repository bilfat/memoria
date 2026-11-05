'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { processEmailJobsBatch } from '@/lib/brevo';

/**
 * Admin Action: Menjadwalkan pengiriman ulang tiket ke antrean email_jobs
 * (Asynchronous queue, tidak melakukan pengiriman langsung dari browser)
 */
export async function enqueueTicketResendAction(participantId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return {
        success: false,
        error: 'Akses ditolak. Hanya Admin Panitia yang dapat mengirim ulang tiket.',
      };
    }

    const admin = createAdminClient();

    // 1. Pastikan peserta ada
    const { data: participant, error: partError } = await admin
      .from('participants')
      .select('id, full_name, email, ticket_number')
      .eq('id', participantId)
      .single();

    if (partError || !participant) {
      return { success: false, error: 'Peserta tidak ditemukan.' };
    }

    // 2. Masukkan job pengiriman ulang ke email_jobs
    const dedupeKey = `ticket_resend_${participant.id}_${Date.now()}`;
    const { error: jobError } = await admin.from('email_jobs').insert({
      kind: 'ticket_resend',
      participant_id: participant.id,
      recipient_email: participant.email,
      dedupe_key: dedupeKey,
      status: 'pending',
      run_after: new Date().toISOString(),
    });

    if (jobError) {
      console.error('[enqueueTicketResendAction] Job error:', jobError);
      return { success: false, error: 'Gagal memasukkan tiket ke antrean pengiriman email.' };
    }

    // 3. Catat ke audit_logs
    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'ENQUEUE_TICKET_RESEND',
      entity_type: 'email_jobs',
      entity_id: participant.id,
      details: {
        ticketNumber: participant.ticket_number,
        recipientEmail: participant.email,
        dedupeKey,
      },
    });

    return {
      success: true,
      message: `Email tiket untuk ${participant.full_name} (${participant.ticket_number}) telah dijadwalkan ke antrean pengiriman.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Admin Action: Memproses satu batch antrean worker secara manual dari dashboard panitia
 */
export async function runManualEmailWorkerBatchAction(): Promise<{
  success: boolean;
  claimed: number;
  sent: number;
  failed: number;
  retried: number;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session) {
      return { success: false, claimed: 0, sent: 0, failed: 0, retried: 0, error: 'Sesi tidak valid.' };
    }

    return await processEmailJobsBatch(10);
  } catch (err: any) {
    return {
      success: false,
      claimed: 0,
      sent: 0,
      failed: 0,
      retried: 0,
      error: err.message || 'Terjadi kesalahan eksekusi antrean.',
    };
  }
}

