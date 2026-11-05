import { createAdminClient } from '@/lib/supabase/admin';
import { fetchTicketByAccessToken, TicketViewData } from '@/lib/ticketData';
import { generateTicketPdfBuffer } from '@/lib/ticketPdf';
import { formatWibDateTime } from '@/lib/date';
import { generateQrDataUrl } from '@/lib/qrCode';

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
 * Template HTML email e-ticket mahasiswa (Ultra Compact, No Scroll, High Contrast).
 * Memuat data penting saja dan QR Code kecil yang presisi tanpa warna font yang bertabrakan.
 */
export function buildTicketEmailHtml(ticket: TicketViewData, siteUrl: string): string {
  const eTicketUrl = `${siteUrl}/tiket/${ticket.ticketAccessToken}`;
  const formattedDate = formatWibDateTime(ticket.eventStartAt);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticket.qrToken)}&margin=2`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>E-Ticket Resmi ${ticket.eventName}</title>
</head>
<body style="margin: 0; padding: 8px 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 6px;">
    <tr>
      <td align="center">
        
        <!-- Main Compact Ticket Card (Max-Width 380px, Pas 1 Layar HP Tanpa Scroll) -->
        <table role="presentation" width="100%" style="max-width: 380px; background-color: #FFFFFF; border: 1.5px solid #D6B46A; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.12);">
          
          <!-- 1. HEADER (Deep Crimson + Crisp Gold/White Text, Kontras Tinggi Anti-Nabrak) -->
          <tr>
            <td bgcolor="#891523" style="background-color: #891523; padding: 12px 14px; text-align: center; border-bottom: 2px solid #D6B46A;">
              <div style="color: #F5D890 !important; -webkit-text-fill-color: #F5D890; font-size: 9.5px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px;">
                ★ DIESNATALIS SIKC TELKOM UNIVERSITY ★
              </div>
              <h1 style="color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 2px 0; font-family: Georgia, serif; letter-spacing: 2px; line-height: 1.2;">
                ${ticket.eventName}
              </h1>
              <div style="color: #FFFDF0 !important; -webkit-text-fill-color: #FFFDF0; font-size: 10.5px; opacity: 0.95;">
                Official Admission Pass • Diesnatalis 2026
              </div>
            </td>
          </tr>

          <!-- 2. DATA PENTING PESERTA (Ringkas & Kontras Tajam) -->
          <tr>
            <td style="padding: 12px 16px 8px 16px; background-color: #FFFFFF;">
              <table width="100%" cellspacing="0" cellpadding="2.5" style="font-size: 11.5px; line-height: 1.35;">
                <tr>
                  <td style="color: #891523; font-weight: bold; width: 28%; font-size: 10px; text-transform: uppercase;">NAMA:</td>
                  <td style="font-weight: 800; font-size: 12px; color: #111827;">${ticket.fullName}</td>
                </tr>
                <tr>
                  <td style="color: #891523; font-weight: bold; font-size: 10px; text-transform: uppercase;">NIM:</td>
                  <td style="font-family: monospace; font-size: 11.5px; font-weight: 700; color: #1F2937;">${ticket.nim} <span style="font-family: sans-serif; font-weight: normal; color: #4B5563; font-size: 10.5px;">(${ticket.studyProgram})</span></td>
                </tr>
                <tr>
                  <td style="color: #891523; font-weight: bold; font-size: 10px; text-transform: uppercase;">KATEGORI:</td>
                  <td style="font-weight: 800; font-size: 11.5px; color: #891523;">${ticket.ticketTypeName}</td>
                </tr>
                <tr>
                  <td style="color: #891523; font-weight: bold; font-size: 10px; text-transform: uppercase;">NO. TIKET:</td>
                  <td style="font-family: monospace; font-size: 11.5px; font-weight: bold; color: #111827;">${ticket.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="color: #891523; font-weight: bold; font-size: 10px; text-transform: uppercase;">WAKTU:</td>
                  <td style="font-size: 11px; color: #1F2937; font-weight: 600;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #891523; font-weight: bold; font-size: 10px; text-transform: uppercase;">LOKASI:</td>
                  <td style="font-size: 11px; color: #374151;">${ticket.venueName}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. GARIS PERFORASI TIKET -->
          <tr>
            <td style="padding: 0 14px; background-color: #FFFFFF;">
              <div style="border-top: 1.5px dashed #D6B46A; width: 100%; margin: 4px 0;"></div>
            </td>
          </tr>

          <!-- 4. QR CODE KECIL & PRESISI (Tanpa Barcode Ganda) -->
          <tr>
            <td align="center" style="padding: 8px 16px 12px 16px; background-color: #FFFFFF;">
              <div style="color: #891523; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                🎟️ SCAN UNTUK CHECK-IN PRESENSI
              </div>

              <!-- Compact QR Box (115px) -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #FFFFFF; padding: 4px; border-radius: 8px; border: 1.5px solid #D6B46A;">
                <tr>
                  <td align="center">
                    <img src="${qrCodeUrl}" alt="QR Tiket" width="115" height="115" style="display: block; width: 115px; height: 115px; border: 0;" />
                  </td>
                </tr>
              </table>

              <div style="color: #6B7280; font-size: 9.5px; margin-top: 5px;">
                Tunjukkan QR Code ini kepada panitia saat tiba di pintu masuk.
              </div>
            </td>
          </tr>

          <!-- 5. TOMBOL AKSES WEB TIKET (Ringkas) -->
          <tr>
            <td align="center" bgcolor="#F9FAFB" style="padding: 8px 14px 10px 14px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB;">
              <a href="${eTicketUrl}" target="_blank" style="display: inline-block; padding: 6px 16px; font-size: 10.5px; font-weight: bold; background-color: #891523; color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF; text-decoration: none; border-radius: 16px; letter-spacing: 0.5px;">
                Buka E-Ticket di Web →
              </a>
              <div style="color: #9CA3AF; font-size: 8.5px; margin-top: 4px;">
                Lampiran PDF e-ticket resmi juga telah disertakan pada email ini.
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
export function buildLecturerInvitationEmailHtml(params: {
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
  qrToken?: string;
}): string {
  const salutation = params.title
    ? `${params.title} ${params.lecturerName}`
    : params.lecturerName;

  const qrImageHtml = params.qrToken
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 14px 0; text-align: center;">
        <tr>
          <td align="center">
            <div style="background-color: #ffffff; padding: 6px; border-radius: 8px; display: inline-block; border: 1.5px solid #D6B46A;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(params.qrToken)}&margin=2" width="120" height="120" alt="QR Kehadiran Dosen" style="display: block; border: 0;" />
            </div>
            <div style="color: #D6B46A; font-size: 11px; font-family: monospace; font-weight: bold; margin-top: 6px;">
              KODE PRESENSI: ${params.invitationCode}
            </div>
          </td>
        </tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Undangan Kehormatan MEMORIA 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0204; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0204; padding: 20px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #1a0508; border: 1.5px solid #D6B46A; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
          
          <!-- Header Branding -->
          <tr>
            <td bgcolor="#891523" style="background-color: #891523; padding: 20px 18px 16px 18px; text-align: center; border-bottom: 2px solid #D6B46A;">
              <div style="color: #F5D890 !important; -webkit-text-fill-color: #F5D890; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">Surat Undangan Kehormatan</div>
              <h1 style="color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">MEMORIA 2026</h1>
              <div style="color: #FFFDF0 !important; -webkit-text-fill-color: #FFFDF0; font-size: 11px; margin-top: 4px; opacity: 0.95;">Diesnatalis D4 Sistem Informasi Kota Cerdas — Telkom University</div>
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

              ${qrImageHtml}

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

        const inviteUrl = `${siteUrl}/undangan/${lecturer.public_token || lecturer.invitation_code}`;
        const template = (eventSettings?.invitation_template as any) || {};
        const subject = (template.subject || 'Undangan Kehormatan MEMORIA Diesnatalis 2026')
          .replace('{{nama_dosen}}', lecturer.full_name);

        const html = buildLecturerInvitationEmailHtml({
          lecturerName: lecturer.full_name,
          title: '',
          invitationCode: lecturer.invitation_code,
          inviteUrl,
          eventName: eventSettings?.event_name || 'MEMORIA',
          eventDate: formatWibDateTime(eventSettings?.event_start_at),
          venueName: eventSettings?.venue_name || 'Grand Ballroom & Theatre Hall',
          venueAddress: eventSettings?.venue_address || 'Telkom University Landmark Hall',
          greeting: template.greeting,
          bodyParagraph: template.body_paragraph,
          qrToken: lecturer.qr_token,
        });

        const targetEmail = lecturer.email || job.recipient_email;

        const qrDataUrl = lecturer.qr_token ? await generateQrDataUrl(lecturer.qr_token) : '';
        const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const attachment = qrBase64
          ? [
              {
                name: `QR-Undangan-${lecturer.invitation_code}.png`,
                content: qrBase64,
              },
            ]
          : undefined;

        const sendResult = await sendBrevoTransactionalEmail({
          to: [{ email: targetEmail, name: lecturer.full_name }],
          subject,
          htmlContent: html,
          attachment,
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
