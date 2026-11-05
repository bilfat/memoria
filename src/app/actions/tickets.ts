'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { ticketTypeInputSchema } from '@/lib/validations';
import { normalizeWibToUtcIso, computeDerivedStatus } from '@/lib/ticketUtils';
import { fetchTicketByAccessToken, type TicketViewData } from '@/lib/ticketData';

export type TicketAdminStatus = 'draft' | 'published' | 'archived';
export type TicketDerivedStatus = 'upcoming' | 'open' | 'sold_out' | 'closed';

export interface TicketTypeAdminDTO {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  registrationOpenAt: string;
  registrationCloseAt: string;
  status: TicketAdminStatus;
  activeCount: number;
  remainingQuota: number | null;
  derivedStatus: TicketDerivedStatus;
  derivedStatusLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypePublicDTO {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  remainingQuota: number | null;
  registrationOpenAt: string;
  registrationCloseAt: string;
  derivedStatus: TicketDerivedStatus;
  derivedStatusLabel: string;
  isAvailable: boolean;
}

/**
 * Public Projection: Ambil seluruh tiket yang status-nya 'published'
 * beserta kuota tersisa dan derived status riil.
 */
export async function getPublicTicketsAction(): Promise<TicketTypePublicDTO[]> {
  try {
    const admin = createAdminClient();

    // 1. Ambil tiket berstatus published
    const { data: tickets, error: ticketError } = await admin
      .from('ticket_types')
      .select('id, name, description, capacity, registration_open_at, registration_close_at, status')
      .eq('status', 'published')
      .order('registration_open_at', { ascending: true });

    if (ticketError) {
      console.error('[TicketsAction] getPublicTicketsAction ticketError:', ticketError);
      return [];
    }

    if (!tickets || tickets.length === 0) {
      return [];
    }

    // 2. Ambil count peserta aktif
    const ticketIds = tickets.map((t) => t.id);
    const { data: participants, error: partError } = await admin
      .from('participants')
      .select('ticket_type_id')
      .in('ticket_type_id', ticketIds)
      .eq('status', 'active');

    if (partError) {
      console.error('[TicketsAction] getPublicTicketsAction partError:', partError);
    }

    const countMap: Record<string, number> = {};
    if (participants) {
      for (const p of participants) {
        countMap[p.ticket_type_id] = (countMap[p.ticket_type_id] || 0) + 1;
      }
    }

    const now = new Date();

    return tickets.map((t) => {
      const activeCount = countMap[t.id] || 0;
      const remainingQuota =
        t.capacity !== null ? Math.max(0, t.capacity - activeCount) : null;
      const derived = computeDerivedStatus(
        {
          status: t.status as TicketAdminStatus,
          registration_open_at: t.registration_open_at,
          registration_close_at: t.registration_close_at,
          capacity: t.capacity,
        },
        activeCount,
        now
      );

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        capacity: t.capacity,
        remainingQuota,
        registrationOpenAt: t.registration_open_at,
        registrationCloseAt: t.registration_close_at,
        derivedStatus: derived.status,
        derivedStatusLabel: derived.label,
        isAvailable: derived.isAvailable,
      };
    });
  } catch (err) {
    console.error('[TicketsAction] getPublicTicketsAction caught exception:', err);
    return [];
  }
}

/**
 * Admin Action: Ambil semua tiket (draft, published, archived) untuk dashboard panitia
 */
export async function listAdminTicketsAction(): Promise<{
  success: boolean;
  tickets?: TicketTypeAdminDTO[];
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session) {
      return { success: false, error: 'Sesi login tidak valid atau kadaluarsa.' };
    }

    const admin = createAdminClient();

    // 1. Fetch tickets
    const { data: tickets, error: ticketError } = await admin
      .from('ticket_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketError) {
      return { success: false, error: ticketError.message };
    }

    if (!tickets || tickets.length === 0) {
      return { success: true, tickets: [] };
    }

    // 2. Fetch active participants count per ticket
    const ticketIds = tickets.map((t) => t.id);
    const { data: participants, error: partError } = await admin
      .from('participants')
      .select('ticket_type_id')
      .in('ticket_type_id', ticketIds)
      .eq('status', 'active');

    if (partError) {
      console.error('[TicketsAction] listAdminTicketsAction partError:', partError);
    }

    const countMap: Record<string, number> = {};
    if (participants) {
      for (const p of participants) {
        countMap[p.ticket_type_id] = (countMap[p.ticket_type_id] || 0) + 1;
      }
    }

    const now = new Date();

    const dtos: TicketTypeAdminDTO[] = tickets.map((t) => {
      const activeCount = countMap[t.id] || 0;
      const remainingQuota =
        t.capacity !== null ? Math.max(0, t.capacity - activeCount) : null;
      const derived = computeDerivedStatus(
        {
          status: t.status as TicketAdminStatus,
          registration_open_at: t.registration_open_at,
          registration_close_at: t.registration_close_at,
          capacity: t.capacity,
        },
        activeCount,
        now
      );

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        capacity: t.capacity,
        registrationOpenAt: t.registration_open_at,
        registrationCloseAt: t.registration_close_at,
        status: t.status as TicketAdminStatus,
        activeCount,
        remainingQuota,
        derivedStatus: derived.status,
        derivedStatusLabel: derived.label,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      };
    });

    return { success: true, tickets: dtos };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Admin Action: Ambil detail satu tiket beserta activeCount saat ini
 */
export async function getAdminTicketAction(id: string): Promise<{
  success: boolean;
  ticket?: TicketTypeAdminDTO;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session) {
      return { success: false, error: 'Sesi login tidak valid atau kadaluarsa.' };
    }

    const admin = createAdminClient();

    const { data: ticket, error: ticketError } = await admin
      .from('ticket_types')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return { success: false, error: 'Jenis tiket tidak ditemukan.' };
    }

    const { count, error: countError } = await admin
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('ticket_type_id', id)
      .eq('status', 'active');

    if (countError) {
      console.error('[TicketsAction] getAdminTicketAction countError:', countError);
    }

    const activeCount = count || 0;
    const remainingQuota =
      ticket.capacity !== null ? Math.max(0, ticket.capacity - activeCount) : null;
    const derived = computeDerivedStatus(
      {
        status: ticket.status as TicketAdminStatus,
        registration_open_at: ticket.registration_open_at,
        registration_close_at: ticket.registration_close_at,
        capacity: ticket.capacity,
      },
      activeCount,
      new Date()
    );

    return {
      success: true,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        capacity: ticket.capacity,
        registrationOpenAt: ticket.registration_open_at,
        registrationCloseAt: ticket.registration_close_at,
        status: ticket.status as TicketAdminStatus,
        activeCount,
        remainingQuota,
        derivedStatus: derived.status,
        derivedStatusLabel: derived.label,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Admin Action: Simpan atau Perbarui Jenis Tiket
 */
export async function saveTicketAction(rawInput: unknown): Promise<{
  success: boolean;
  ticketId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return {
        success: false,
        error: 'Akses ditolak. Hanya Admin Panitia yang memiliki izin mengelola tiket.',
      };
    }

    const parsed = ticketTypeInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || 'Validasi formulir tiket gagal.';
      return {
        success: false,
        error: firstErrorMessage,
        fieldErrors: fieldErrors as Record<string, string[]>,
      };
    }

    const data = parsed.data;
    const admin = createAdminClient();

    const normalizedOpenAt = normalizeWibToUtcIso(data.registrationOpenAt);
    const normalizedCloseAt = normalizeWibToUtcIso(data.registrationCloseAt);

    if (new Date(normalizedCloseAt).getTime() <= new Date(normalizedOpenAt).getTime()) {
      return {
        success: false,
        error: 'Waktu penutupan pendaftaran harus lebih akhir dari waktu pembukaan.',
      };
    }

    if (data.id) {
      // 1. UPDATE EXISTING TICKET
      // Cek jumlah peserta aktif saat ini untuk memastikan kapasitas baru tidak melanggar batas
      const { count: activeCount } = await admin
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('ticket_type_id', data.id)
        .eq('status', 'active');

      const currentActive = activeCount || 0;

      if (data.capacity !== null && data.capacity < currentActive) {
        return {
          success: false,
          error: `Kapasitas baru (${data.capacity}) tidak boleh lebih kecil dari jumlah peserta aktif saat ini (${currentActive} peserta).`,
        };
      }

      const { error: updateError } = await admin
        .from('ticket_types')
        .update({
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          registration_open_at: normalizedOpenAt,
          registration_close_at: normalizedCloseAt,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Audit log
      await admin.from('audit_logs').insert({
        actor_id: session.id,
        action: 'UPDATE_TICKET_TYPE',
        entity_type: 'ticket_types',
        entity_id: data.id,
        details: {
          name: data.name,
          capacity: data.capacity,
          status: data.status,
        },
      });

      revalidatePath('/panitia/tiket');
      revalidatePath(`/panitia/tiket/${data.id}/edit`);
      revalidatePath('/daftar');
      revalidatePath('/panitia');

      return { success: true, ticketId: data.id };
    } else {
      // 2. CREATE NEW TICKET
      const { data: inserted, error: insertError } = await admin
        .from('ticket_types')
        .insert({
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          registration_open_at: normalizedOpenAt,
          registration_close_at: normalizedCloseAt,
          status: data.status,
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        return { success: false, error: insertError?.message || 'Gagal menambahkan jenis tiket.' };
      }

      // Audit log
      await admin.from('audit_logs').insert({
        actor_id: session.id,
        action: 'CREATE_TICKET_TYPE',
        entity_type: 'ticket_types',
        entity_id: inserted.id,
        details: {
          name: data.name,
          capacity: data.capacity,
          status: data.status,
        },
      });

      revalidatePath('/panitia/tiket');
      revalidatePath('/daftar');
      revalidatePath('/panitia');

      return { success: true, ticketId: inserted.id };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Admin Action: Toggle Status Publikasi (Draft <-> Published)
 */
export async function toggleTicketPublishAction(id: string): Promise<{
  success: boolean;
  newStatus?: TicketAdminStatus;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return { success: false, error: 'Hanya Admin Panitia yang dapat mengubah status publikasi tiket.' };
    }

    const admin = createAdminClient();

    const { data: ticket, error: fetchError } = await admin
      .from('ticket_types')
      .select('id, name, status')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: 'Jenis tiket tidak ditemukan.' };
    }

    if (ticket.status === 'archived') {
      return {
        success: false,
        error: 'Tiket dalam status arsip tidak dapat langsung dipublikasikan. Silakan edit tiket untuk mengaktifkannya kembali.',
      };
    }

    const newStatus: TicketAdminStatus = ticket.status === 'published' ? 'draft' : 'published';

    const { error: updateError } = await admin
      .from('ticket_types')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'TOGGLE_TICKET_PUBLICATION',
      entity_type: 'ticket_types',
      entity_id: id,
      details: {
        previousStatus: ticket.status,
        newStatus,
      },
    });

    revalidatePath('/panitia/tiket');
    revalidatePath('/daftar');
    revalidatePath('/panitia');

    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Admin Action: Mengarsipkan Jenis Tiket
 * Catatan: Mengarsipkan tiket TIDAK membatalkan tiket peserta yang sudah terbit!
 */
export async function archiveTicketAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return { success: false, error: 'Hanya Admin Panitia yang dapat mengarsipkan jenis tiket.' };
    }

    const admin = createAdminClient();

    const { error: updateError } = await admin
      .from('ticket_types')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'ARCHIVE_TICKET_TYPE',
      entity_type: 'ticket_types',
      entity_id: id,
      details: {
        action: 'archived',
      },
    });

    revalidatePath('/panitia/tiket');
    revalidatePath('/daftar');
    revalidatePath('/panitia');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

export interface PublicTicketSearchResult {
  success: boolean;
  found: boolean;
  message?: string;
  ticket?: {
    fullName: string;
    nim: string;
    ticketNumber: string;
    studyProgram: string;
    faculty: string;
    ticketTypeName: string;
    ticketAccessToken: string;
    status: 'active' | 'archived';
    registeredAt: string;
  };
}

/**
 * Public Action: Cek & Cari Tiket berdasarkan NIM atau Nomor Tiket (ID Order)
 */
export async function searchPublicTicketAction(identifier: string): Promise<PublicTicketSearchResult> {
  const q = identifier ? identifier.trim() : '';
  if (!q) {
    return { success: false, found: false, message: 'Harap masukkan NIM atau ID Order / Nomor Tiket.' };
  }

  try {
    const admin = createAdminClient();

    // Query participants by NIM (exact trimmed case-insensitive) OR ticket_number OR ticket_access_token
    const { data: part, error } = await admin
      .from('participants')
      .select('id, full_name, nim, study_program, faculty, ticket_number, ticket_access_token, ticket_type_id, status, created_at')
      .or(`nim.ilike.${q},ticket_number.ilike.${q},ticket_access_token.eq.${q}`)
      .limit(1)
      .maybeSingle();

    if (error || !part) {
      return {
        success: true,
        found: false,
        message: 'Tiket tidak ditemukan. Pastikan NIM atau Nomor Tiket (ID Order) yang Anda masukkan sudah benar.',
      };
    }

    // Ambil nama jenis tiket
    const { data: type } = await admin
      .from('ticket_types')
      .select('name')
      .eq('id', part.ticket_type_id)
      .single();

    return {
      success: true,
      found: true,
      ticket: {
        fullName: part.full_name,
        nim: part.nim,
        ticketNumber: part.ticket_number,
        studyProgram: part.study_program,
        faculty: part.faculty,
        ticketTypeName: type?.name || 'Tiket Regular',
        ticketAccessToken: part.ticket_access_token,
        status: part.status as 'active' | 'archived',
        registeredAt: part.created_at,
      },
    };
  } catch (err: any) {
    console.error('[searchPublicTicketAction] Error:', err);
    return {
      success: false,
      found: false,
      message: err.message || 'Terjadi kesalahan sistem saat mencari tiket.',
    };
  }
}

/**
 * Public Action: Mengambil data e-ticket publik untuk halaman /tiket/[token]
 * Dieksekusi secara aman di server environment dengan service role key.
 */
export async function getTicketViewDataAction(token: string): Promise<TicketViewData | null> {
  if (!token || typeof token !== 'string') return null;
  return fetchTicketByAccessToken(token.trim());
}

