import { createAdminClient } from '@/lib/supabase/admin';

export interface TicketViewData {
  participantId: string;
  fullName: string;
  nim: string;
  studyProgram: string;
  faculty: string;
  phone: string;
  email: string;
  ticketNumber: string;
  ticketTypeId: string;
  ticketTypeName: string;
  ticketStatus: 'active' | 'archived';
  ticketAccessToken: string;
  qrToken: string;
  registeredAt: string;
  eventName: string;
  eventStartAt: string;
  eventEndAt?: string | null;
  venueName: string;
  venueAddress: string;
  footerText: string;
}

/**
 * Mengambil data tiket lengkap berdasarkan ticket_access_token rahasia.
 * Menggabungkan tabel participants, ticket_types, dan event_settings secara real-time.
 */
export async function fetchTicketByAccessToken(token: string): Promise<TicketViewData | null> {
  if (!token || token.trim().length === 0) {
    return null;
  }

  try {
    const admin = createAdminClient();

    // 1. Ambil data peserta berdasarkan ticket_access_token
    const { data: participant, error: partError } = await admin
      .from('participants')
      .select('id, full_name, nim, study_program, faculty, phone, email, ticket_number, ticket_type_id, ticket_access_token, qr_token, status, created_at')
      .eq('ticket_access_token', token.trim())
      .single();

    if (partError || !participant) {
      return null;
    }

    // 2. Ambil data jenis tiket
    const { data: ticketType } = await admin
      .from('ticket_types')
      .select('name')
      .eq('id', participant.ticket_type_id)
      .single();

    // 3. Ambil data event settings terbaru
    const { data: eventSettings, error: eventError } = await admin
      .from('event_settings')
      .select('event_name, event_start_at, venue_name, venue_address, footer_text')
      .eq('id', 1)
      .single();

    if (eventError || !eventSettings) {
      console.error('[fetchTicketByAccessToken] Event settings missing or error:', eventError);
      return null;
    }

    return {
      participantId: participant.id,
      fullName: participant.full_name,
      nim: participant.nim,
      studyProgram: participant.study_program,
      faculty: participant.faculty,
      phone: participant.phone,
      email: participant.email,
      ticketNumber: participant.ticket_number,
      ticketTypeId: participant.ticket_type_id,
      ticketTypeName: ticketType?.name || 'Tiket Regular',
      ticketStatus: participant.status as 'active' | 'archived',
      ticketAccessToken: participant.ticket_access_token,
      qrToken: participant.qr_token,
      registeredAt: participant.created_at,
      eventName: eventSettings.event_name,
      eventStartAt: eventSettings.event_start_at,
      eventEndAt: null,
      venueName: eventSettings.venue_name,
      venueAddress: eventSettings.venue_address || '',
      footerText: eventSettings.footer_text || '',
    };
  } catch (err) {
    console.error('[fetchTicketByAccessToken] Exception:', err);
    return null;
  }
}

