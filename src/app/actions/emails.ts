'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { processEmailJobsBatch, buildTicketEmailHtml, sendBrevoTransactionalEmail } from '@/lib/brevo';
import { fetchTicketByAccessToken } from '@/lib/ticketData';
import { generateTicketPdfBuffer } from '@/lib/ticketPdf';

/**
 * Admin Action: Mengirimkan ulang tiket secara langsung ke email peserta
 * (Disertai lampiran berkas PDF dan barcode/QR langsung ke Brevo)
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
      .select('id, full_name, email, ticket_number, ticket_access_token')
      .eq('id', participantId)
      .single();

    if (partError || !participant) {
      return { success: false, error: 'Peserta tidak ditemukan.' };
    }

    if (!participant.email || !participant.email.includes('@')) {
      return { success: false, error: 'Alamat email peserta tidak valid atau kosong.' };
    }

    // 2. Ambil data tiket lengkap untuk PDF dan Email
    const ticketData = await fetchTicketByAccessToken(participant.ticket_access_token);
    if (!ticketData) {
      return { success: false, error: 'Data tiket tidak dapat dimuat dari database.' };
    }

    // 3. Generate PDF dan HTML email tiket
    const pdfBuffer = await generateTicketPdfBuffer(ticketData);
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memoria2026.com';
    const html = buildTicketEmailHtml(ticketData, siteUrl);

    // 4. Kirim LANGSUNG via Brevo Transactional Email
    const sendResult = await sendBrevoTransactionalEmail({
      to: [{ email: participant.email, name: ticketData.fullName }],
      subject: `🎟️ E-Ticket Resmi: ${ticketData.eventName} (${ticketData.ticketNumber})`,
      htmlContent: html,
      attachment: [
        {
          name: `E-Ticket-${ticketData.ticketNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    // 5. Catat ke tabel email_jobs agar tercatat riwayatnya
    const dedupeKey = `ticket_resend_${participant.id}_${Date.now()}`;
    await admin.from('email_jobs').insert({
      kind: 'ticket_resend',
      participant_id: participant.id,
      recipient_email: participant.email,
      dedupe_key: dedupeKey,
      status: sendResult.success ? 'sent' : 'failed',
      sent_at: sendResult.success ? new Date().toISOString() : null,
      provider_message_id: sendResult.messageId || null,
      last_error_code: sendResult.error || null,
      run_after: new Date().toISOString(),
    });

    // 6. Catat ke audit_logs
    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'DIRECT_TICKET_RESEND',
      entity_type: 'email_jobs',
      entity_id: participant.id,
      details: {
        ticketNumber: participant.ticket_number,
        recipientEmail: participant.email,
        success: sendResult.success,
        messageId: sendResult.messageId,
        error: sendResult.error,
      },
    });

    if (!sendResult.success) {
      return {
        success: false,
        error: `Gagal mengirim email: ${sendResult.error || 'Server Brevo menolak pengiriman.'}`,
      };
    }

    return {
      success: true,
      message: `Tiket dan berkas PDF resmi berhasil dikirim langsung ke ${participant.email}!`,
    };
  } catch (err: any) {
    console.error('[enqueueTicketResendAction] Exception:', err);
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

