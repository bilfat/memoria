import { createAdminClient } from '@/lib/supabase/admin';
import { fetchTicketByAccessToken, TicketViewData } from '@/lib/ticketData';
import { generateTicketPdfBuffer } from '@/lib/ticketPdf';
import { formatWibDateTime } from '@/lib/date';

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  name: string;
  content: string; // Base64 encoded string
}

export interface SendBrevoEmailParams {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  attachment?: BrevoAttachment[];
}

export interface SendBrevoEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Mengirim email transaksional via Brevo REST API (Server-Only).
 * TIDAK ADA FAKE-SUCCESS / MOCK MESSAGE ID.
 * Jika API key kosong atau belum dikonfigurasi, mengembalikan status gagal yang jujur.
 */
export async function sendBrevoTransactionalEmail(
  params: SendBrevoEmailParams
): Promise<SendBrevoEmailResult> {
  const apiKey = process.env.BREVO_API_KEY || '';
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || 'noreply@memoria.telkomuniversity.ac.id';
  const senderName = process.env.BREVO_SENDER_NAME || 'Panitia MEMORIA 2026';

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('mock_') || apiKey.startsWith('your-')) {
    console.error('[Brevo Service] BREVO_API_KEY belum dikonfigurasi pada environment server.');
    return {
      success: false,
      error: 'BREVO_API_KEY belum dikonfigurasi pada environment server.',
    };
  }

  try {
    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: params.to.map((r) => ({
        email: r.email,
        name: r.name || r.email.split('@')[0],
      })),
      subject: params.subject,
      htmlContent: params.htmlContent,
      attachment: params.attachment,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey.trim(),
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status} from Brevo`;
      console.error('[Brevo Service] API Error:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data?.messageId || `brevo-${Date.now()}`,
    };
  } catch (err: any) {
    console.error('[Brevo Service] Network exception:', err);
    return {
      success: false,
      error: err.message || 'Gagal menghubungi server Brevo.',
    };
  }
}

/**
 * Template HTML email e-ticket mahasiswa bertema Carnival Theatrical yang ringkas & padat.
 * Dilengkapi dengan QR Code dan Barcode check-in langsung di dalam body email.
 */
export function buildTicketEmailHtml(ticket: TicketViewData, siteUrl: string): string {
  const eTicketUrl = `${siteUrl}/tiket/${ticket.ticketAccessToken}`;
  const formattedDate = formatWibDateTime(ticket.eventStartAt);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.qrToken)}&margin=4`;
  const barcodeUrl = `https://barcodeapi.org/api/auto/${encodeURIComponent(ticket.ticketNumber)}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <title>E-Ticket Resmi ${ticket.eventName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0204; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-text-size-adjust: 100%;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0204; padding: 20px 8px;">
    <tr>
      <td align="center">
        
        <!-- Main Carnival Card Container (Ringkas, Max 460px) -->
        <table role="presentation" width="100%" style="max-width: 460px; background-color: #1a0508; border: 2px solid #D6B46A; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
          
          <!-- 1. COMPACT CARNIVAL HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #891523 0%, #4a0810 100%); padding: 14px 16px; text-align: center; border-bottom: 2px solid #D6B46A;">
              <div style="color: #FFFDF0; font-size: 11px; letter-spacing: 5px; margin-bottom: 2px;">
                ● ○ ● ○ ● ○ ●
              </div>
              <div style="color: #F6C86C; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                ★ DIESNATALIS SIKC TELKOM UNIVERSITY ★
              </div>
              <h1 style="color: #FFFFFF; font-size: 26px; font-weight: bold; margin: 4px 0 2px 0; font-family: Georgia, serif; letter-spacing: 3px;">
                ${ticket.eventName}
              </h1>
              <div style="color: #F5D890; font-size: 11px; font-style: italic;">
                Velvet Night — Official Admission Pass
              </div>
            </td>
          </tr>

          <!-- 2. RINGKASAN DATA TIKET -->
          <tr>
            <td style="padding: 16px 20px 12px 20px; background-color: #1a0508;">
              <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 12px; color: #FFFFFF;">
                <tr>
                  <td style="color: #D6B46A; font-weight: bold; width: 30%; font-size: 11px; text-transform: uppercase;">NAMA:</td>
                  <td style="font-weight: bold; font-size: 13px; color: #FFFFFF;">${ticket.fullName}</td>
                </tr>
                <tr>
                  <td style="color: #D6B46A; font-weight: bold; font-size: 11px; text-transform: uppercase;">NIM:</td>
                  <td style="font-family: monospace; font-size: 12px; color: #E5D5C8;">${ticket.nim} (${ticket.studyProgram})</td>
                </tr>
                <tr>
                  <td style="color: #D6B46A; font-weight: bold; font-size: 11px; text-transform: uppercase;">KATEGORI:</td>
                  <td style="font-weight: bold; font-size: 12px; color: #F6C86C;">${ticket.ticketTypeName} (Gratis)</td>
                </tr>
                <tr>
                  <td style="color: #D6B46A; font-weight: bold; font-size: 11px; text-transform: uppercase;">WAKTU:</td>
                  <td style="font-size: 12px; color: #FFFDF0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #D6B46A; font-weight: bold; font-size: 11px; text-transform: uppercase;">LOKASI:</td>
                  <td style="font-size: 12px; color: #E5D5C8;">${ticket.venueName}, ${ticket.venueAddress}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. GARIS PERFORASI TIKET -->
          <tr>
            <td style="padding: 0 16px; background-color: #1a0508;">
              <div style="border-top: 2px dashed #D6B46A; width: 100%;"></div>
            </td>
          </tr>

          <!-- 4. SCAN CODE SECTION: QR CODE & BARCODE LANGSUNG DI EMAIL -->
          <tr>
            <td align="center" style="padding: 16px 20px; background-color: #24080e;">
              
              <div style="color: #F6C86C; font-size: 10.5px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">
                🎟️ SCAN UNTUK CHECK-IN PRESENSI
              </div>

              <!-- QR Code Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #FFFFFF; padding: 10px; border-radius: 12px; border: 2px solid #D6B46A; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
                <tr>
                  <td align="center">
                    <img src="${qrCodeUrl}" alt="QR Code Tiket" width="180" height="180" style="display: block; width: 180px; height: 180px; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Barcode Image -->
              <div style="margin-top: 14px; background-color: #FFFFFF; padding: 8px 14px; border-radius: 8px; display: inline-block; border: 1px solid #D6B46A; max-width: 270px;">
                <img src="${barcodeUrl}" alt="Barcode Tiket" style="display: block; max-width: 100%; height: 42px; margin: 0 auto;" />
                <div style="color: #111827; font-family: monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; margin-top: 4px;">
                  ${ticket.ticketNumber}
                </div>
              </div>

              <div style="color: #C5A880; font-size: 11px; margin-top: 8px;">
                Tunjukkan QR Code atau Barcode di atas kepada panitia saat tiba di gerbang.
              </div>

            </td>
          </tr>

          <!-- 5. TOMBOL TIKET WEB & CATATAN PDF TERLAMPIR -->
          <tr>
            <td align="center" style="padding: 14px 20px; background-color: #1a0508; border-top: 1px solid rgba(214,180,106,0.3);">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 24px; background: linear-gradient(135deg, #891523 0%, #b52735 100%); border: 1px solid #F6C86C;">
                    <a href="${eTicketUrl}" target="_blank" style="display: inline-block; padding: 10px 24px; font-size: 12px; font-weight: bold; color: #FFFFFF; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Buka E-Ticket di Web
                    </a>
                  </td>
                </tr>
              </table>
              <div style="color: #8F7277; font-size: 10px; margin-top: 8px;">
                📎 File PDF e-ticket resmi dengan desain landscape lengkap juga telah dilampirkan.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Template HTML surat undangan dosen kehormatan
 */
function buildLecturerInvitationEmailHtml(params: {
  lecturerName: string;
  title?: string;
  invitationCode: string;
  inviteUrl: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  greeting?: string;
  bodyParagraph?: string;
}): string {
  const salutation = params.title
    ? `${params.title} ${params.lecturerName}`
    : params.lecturerName;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Undangan Kehormatan MEMORIA 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0204; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0204; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1a0508; border: 1px solid #D6B46A; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(180deg, #2c090d 0%, #1a0508 100%); padding: 35px 25px 25px 25px; text-align: center; border-bottom: 1px solid rgba(214, 180, 106, 0.3);">
              <div style="color: #D6B46A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 5px;">Surat Undangan Kehormatan</div>
              <h1 style="color: #FFFFFF; font-size: 30px; font-weight: normal; margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">MEMORIA 2026</h1>
              <div style="color: #F5D890; font-size: 12px; margin-top: 6px; font-style: italic;">Diesnatalis D4 Sistem Informasi Kota Cerdas — Fakultas Ilmu Terapan</div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 25px;">
              <p style="font-size: 14px; line-height: 1.6; color: #E5E7EB; margin-top: 0;">
                ${params.greeting || 'Kepada Yth.'} <strong style="color: #FFFFFF;">${salutation}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #D1D5DB;">
                ${params.bodyParagraph || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami untuk mengundang Bapak/Ibu Dosen menghadiri malam puncak perayaan Diesnatalis SIKC 2026.'}
              </p>

              <!-- Event Schedule Box -->
              <table role="presentation" width="100%" style="background-color: #24080c; border: 1px dashed rgba(214, 180, 106, 0.4); border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 12px;">
                      <tr>
                        <td style="color: #A98A8F; width: 35%;">KODE UNDANGAN:</td>
                        <td style="color: #D6B46A; font-weight: bold; font-family: monospace;">${params.invitationCode}</td>
                      </tr>
                      <tr>
                        <td style="color: #A98A8F;">TANGGAL & JAM:</td>
                        <td style="color: #FFFFFF; font-weight: bold;">${params.eventDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #A98A8F;">TEMPAT:</td>
                        <td style="color: #FFFFFF;">${params.venueName}<br><span style="font-size: 11px; color: #A98A8F;">${params.venueAddress}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.inviteUrl}" target="_blank" style="display: inline-block; background-color: #891523; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 1px; padding: 14px 28px; border-radius: 30px; border: 1px solid #D6B46A; text-transform: uppercase;">
                      Buka Undangan Personal & QR Tamu
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 11px; color: #A98A8F; text-align: center; margin: 15px 0 0 0;">
                Buka tautan di atas untuk melihat amplop interaktif serta QR presensi kehormatan Anda di pintu masuk.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #120305; padding: 20px 25px; text-align: center; border-top: 1px solid rgba(214, 180, 106, 0.2); font-size: 10px; color: #8F7277;">
              Himpunan Mahasiswa D4 Sistem Informasi Kota Cerdas, Telkom University.<br>
              Email resmi panitia MEMORIA 2026.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Worker Engine: Mengambil dan memproses batch antrean email_jobs
 * Mengirim email sungguhan via Brevo API tanpa mock-success.
 */
export async function processEmailJobsBatch(batchSize = 10): Promise<{
  success: boolean;
  claimed: number;
  sent: number;
  failed: number;
  retried: number;
  error?: string;
}> {
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let claimedJobs: any[] = [];

  try {
    // 1. Coba klaim menggunakan SQL RPC claim_email_jobs
    const { data: rpcJobs, error: rpcError } = await admin.rpc('claim_email_jobs', {
      p_limit: batchSize,
      p_lease_seconds: 300,
    });

    if (!rpcError && rpcJobs) {
      claimedJobs = rpcJobs;
    } else {
      // Fallback lease update
      const nowIso = new Date().toISOString();
      const leaseIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { data: candidateJobs } = await admin
        .from('email_jobs')
        .select('id')
        .in('status', ['pending', 'retry'])
        .lte('run_after', nowIso)
        .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
        .order('run_after', { ascending: true })
        .limit(batchSize);

      if (candidateJobs && candidateJobs.length > 0) {
        const ids = candidateJobs.map((j) => j.id);
        const { data: updatedJobs } = await admin
          .from('email_jobs')
          .update({
            status: 'processing',
            locked_at: nowIso,
            lease_until: leaseIso,
            updated_at: nowIso,
          })
          .in('id', ids)
          .select('*');

        claimedJobs = updatedJobs || [];
      }
    }
  } catch (err: any) {
    console.error('[processEmailJobsBatch] Claim error:', err);
    return { success: false, claimed: 0, sent: 0, failed: 0, retried: 0, error: err.message };
  }

  if (claimedJobs.length === 0) {
    return { success: true, claimed: 0, sent: 0, failed: 0, retried: 0 };
  }

  let sentCount = 0;
  let failedCount = 0;
  let retriedCount = 0;

  for (const job of claimedJobs) {
    try {
      if (job.kind === 'ticket_initial' || job.kind === 'ticket_resend') {
        const { data: participant } = await admin
          .from('participants')
          .select('id, email, ticket_access_token')
          .eq('id', job.participant_id)
          .single();

        if (!participant) {
          await admin
            .from('email_jobs')
            .update({
              status: 'failed',
              last_error_code: 'PARTICIPANT_NOT_FOUND',
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          failedCount++;
          continue;
        }

        const ticketData = await fetchTicketByAccessToken(participant.ticket_access_token);
        if (!ticketData) {
          await admin
            .from('email_jobs')
            .update({
              status: 'failed',
              last_error_code: 'TICKET_DATA_UNAVAILABLE',
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          failedCount++;
          continue;
        }

        const pdfBuffer = await generateTicketPdfBuffer(ticketData);
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
        const pdfFilename = `MEMORIA-Ticket-${ticketData.nim}-${ticketData.ticketNumber}.pdf`;

        const subject = `Tiket Elektronik MEMORIA 2026 — ${ticketData.ticketNumber}`;
        const html = buildTicketEmailHtml(ticketData, siteUrl);
        const targetEmail = participant.email || job.recipient_email;

        const sendResult = await sendBrevoTransactionalEmail({
          to: [{ email: targetEmail, name: ticketData.fullName }],
          subject,
          htmlContent: html,
          attachment: [
            {
              name: pdfFilename,
              content: pdfBase64,
            },
          ],
        });

        if (sendResult.success) {
          await admin
            .from('email_jobs')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              provider_message_id: sendResult.messageId || null,
              last_error_code: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          sentCount++;
        } else {
          // Retry handling
          const currentAttempts = (job.attempts || 1) + 1;
          const maxAttempts = 5;

          if (currentAttempts >= maxAttempts) {
            await admin
              .from('email_jobs')
              .update({
                status: 'failed',
                last_error_code: (sendResult.error || 'SEND_FAILED').substring(0, 100),
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);
            failedCount++;
          } else {
            const nextRun = new Date(Date.now() + currentAttempts * 5 * 60 * 1000).toISOString();
            await admin
              .from('email_jobs')
              .update({
                status: 'retry',
                run_after: nextRun,
                last_error_code: (sendResult.error || 'TRANSIENT_ERROR').substring(0, 100),
                lease_until: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);
            retriedCount++;
          }
        }
      } else if (job.kind === 'lecturer_invitation') {
        const { data: lecturer } = await admin
          .from('lecturer_invitations')
          .select('*')
          .eq('id', job.lecturer_id)
          .single();

        if (!lecturer) {
          await admin
            .from('email_jobs')
            .update({
              status: 'failed',
              last_error_code: 'LECTURER_NOT_FOUND',
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          failedCount++;
          continue;
        }

        const { data: eventSettings } = await admin
          .from('event_settings')
          .select('event_name, event_start_at, venue_name, venue_address, invitation_template')
          .eq('id', 1)
          .single();

        const inviteUrl = `${siteUrl}/undangan/${lecturer.invitation_code}`;
        const template = (eventSettings?.invitation_template as any) || {};
        const subject = (template.subject || 'Undangan Kehormatan MEMORIA Diesnatalis 2026')
          .replace('{{nama_dosen}}', lecturer.full_name);

        const html = buildLecturerInvitationEmailHtml({
          lecturerName: lecturer.full_name,
          title: lecturer.title || '',
          invitationCode: lecturer.invitation_code,
          inviteUrl,
          eventName: eventSettings?.event_name || 'MEMORIA',
          eventDate: formatWibDateTime(eventSettings?.event_start_at),
          venueName: eventSettings?.venue_name || 'Grand Ballroom & Theatre Hall',
          venueAddress: eventSettings?.venue_address || 'Telkom University Landmark Hall',
          greeting: template.greeting,
          bodyParagraph: template.body_paragraph,
        });

        const targetEmail = lecturer.email || job.recipient_email;

        const sendResult = await sendBrevoTransactionalEmail({
          to: [{ email: targetEmail, name: lecturer.full_name }],
          subject,
          htmlContent: html,
        });

        if (sendResult.success) {
          await admin
            .from('email_jobs')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              provider_message_id: sendResult.messageId || null,
              last_error_code: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          sentCount++;
        } else {
          const currentAttempts = (job.attempts || 1) + 1;
          const maxAttempts = 5;

          if (currentAttempts >= maxAttempts) {
            await admin
              .from('email_jobs')
              .update({
                status: 'failed',
                last_error_code: (sendResult.error || 'SEND_FAILED').substring(0, 100),
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);
            failedCount++;
          } else {
            const nextRun = new Date(Date.now() + currentAttempts * 5 * 60 * 1000).toISOString();
            await admin
              .from('email_jobs')
              .update({
                status: 'retry',
                run_after: nextRun,
                last_error_code: (sendResult.error || 'TRANSIENT_ERROR').substring(0, 100),
                lease_until: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);
            retriedCount++;
          }
        }
      }
    } catch (jobErr: any) {
      console.error(`[processEmailJobsBatch] Error processing job ${job.id}:`, jobErr);
      await admin
        .from('email_jobs')
        .update({
          status: 'retry',
          last_error_code: (jobErr.message || 'UNCAUGHT_JOB_ERROR').substring(0, 100),
          run_after: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          lease_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);
      retriedCount++;
    }
  }

  return {
    success: true,
    claimed: claimedJobs.length,
    sent: sentCount,
    failed: failedCount,
    retried: retriedCount,
  };
}
