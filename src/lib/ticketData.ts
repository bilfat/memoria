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

    // 1. Ambil data peserta berdasarkan ticket_access_token, qr_token, atau id (jika UUID valid)
    const cleanToken = token.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
    const orFilter = isUuid
      ? `ticket_access_token.eq.${cleanToken},qr_token.eq.${cleanToken},id.eq.${cleanToken}`
      : `ticket_access_token.eq.${cleanToken},qr_token.eq.${cleanToken}`;

    const { data: participant, error: partError } = await admin
      .from('participants')
      .select('id, full_name, nim, study_program, faculty, phone, email, ticket_number, ticket_type_id, ticket_access_token, qr_token, status, created_at')
      .or(orFilter)
      .limit(1)
      .maybeSingle();

    if (partError || !participant) {
      console.warn('[fetchTicketByAccessToken] Participant not found for token:', cleanToken, partError);
      return null;
    }

    // 2. Ambil data jenis tiket
    const { data: ticketType } = await admin
      .from('ticket_types')
      .select('name')
      .eq('id', participant.ticket_type_id)
      .maybeSingle();

    // 3. Ambil data event settings terbaru dengan fallback aman jika tabel belum memiliki row id=1
    const { data: eventSettings } = await admin
      .from('event_settings')
      .select('event_name, event_start_at, venue_name, venue_address, footer_text')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    const eventName = eventSettings?.event_name || 'MEMORIA 2026';
    const eventStartAt = eventSettings?.event_start_at || '2026-11-20T18:30:00+07:00';
    const venueName = eventSettings?.venue_name || 'Grand Ballroom & Theatre Hall';
    const venueAddress = eventSettings?.venue_address || 'Telkom University Landmark Hall, Gedung Selaru Lt. 4, Bandung';
    const footerText = eventSettings?.footer_text || 'MEMORIA 2026 — Himpunan Mahasiswa D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.';

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
      eventName,
      eventStartAt,
      eventEndAt: null,
      venueName,
      venueAddress,
      footerText,
    };
  } catch (err) {
    console.error('[fetchTicketByAccessToken] Exception:', err);
    return null;
  }
}

