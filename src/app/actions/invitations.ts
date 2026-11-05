'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { formatWibDateTime } from '@/lib/date';

export interface InvitationTemplateDTO {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  senderName: string;
}

export interface LecturerListItemDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  invitationCode: string;
  publicToken: string;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
  hasCheckedIn: boolean;
  checkedInAt: string | null;
  checkinMethod: string | null;
}

export interface PublicInvitationViewDTO {
  id: string;
  fullName: string;
  email: string;
  invitationCode: string;
  publicToken: string;
  qrToken: string;
  isActive: boolean;
  eventName: string;
  eventStartAt: string;
  venueName: string;
  venueAddress: string;
  template: {
    subject: string;
    greeting: string;
    renderedBody: string;
    closing: string;
    senderName: string;
  };
}

const DEFAULT_INVITATION_TEMPLATE: InvitationTemplateDTO = {
  subject: 'Undangan Kehormatan Malam Puncak MEMORIA 2026 — Diesnatalis SIKC',
  greeting: 'Kepada Yang Terhormat,',
  body:
    'Merupakan suatu kehormatan dan kebanggaan bagi kami, segenap civitas akademika dan panitia pelaksana Dies Natalis D4 Sistem Informasi Kota Cerdas, untuk mengundang Bapak/Ibu {{nama_dosen}} hadir sebagai Tamu Kehormatan dalam malam puncak MEMORIA — "Velvet Night: A Night to Remember". Kehadiran Bapak/Ibu merupakan wujud apresiasi dan inspirasi terbesar bagi seluruh karya dan prestasi mahasiswa.',
  closing: 'Atas perhatian, bimbingan, dan kehadiran Bapak/Ibu, kami haturkan terima kasih sebesar-besarnya.',
  senderName: 'Panitia Pelaksana MEMORIA 2026 & Himpunan Mahasiswa SIKC',
};

/**
 * Mengambil template surat undangan dosen dari event_settings
 */
export async function getInvitationTemplateAction(): Promise<InvitationTemplateDTO> {
  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from('event_settings')
      .select('invitation_template')
      .eq('id', 1)
      .single();

    if (event?.invitation_template && typeof event.invitation_template === 'object') {
      const t = event.invitation_template as Record<string, any>;
      return {
        subject: t.subject || DEFAULT_INVITATION_TEMPLATE.subject,
        greeting: t.greeting || DEFAULT_INVITATION_TEMPLATE.greeting,
        body: t.body || DEFAULT_INVITATION_TEMPLATE.body,
        closing: t.closing || DEFAULT_INVITATION_TEMPLATE.closing,
        senderName: t.senderName || DEFAULT_INVITATION_TEMPLATE.senderName,
      };
    }

    return DEFAULT_INVITATION_TEMPLATE;
  } catch (err) {
    console.error('[getInvitationTemplateAction] Error:', err);
    return DEFAULT_INVITATION_TEMPLATE;
  }
}

/**
 * Menyimpan pembaruan template surat undangan dosen ke event_settings
 */
export async function updateInvitationTemplateAction(
  template: InvitationTemplateDTO
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return {
        success: false,
        error: 'Akses ditolak. Hanya Admin Panitia yang memiliki izin mengedit template surat.',
      };
    }

    const admin = createAdminClient();

    const { error: updateError } = await admin
      .from('event_settings')
      .update({
        invitation_template: {
          subject: template.subject.trim(),
          greeting: template.greeting.trim(),
          body: template.body.trim(),
          closing: template.closing.trim(),
          senderName: template.senderName.trim(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'UPDATE_INVITATION_TEMPLATE',
      entity_type: 'event_settings',
      entity_id: null,
      details: { subject: template.subject },
    });

    revalidatePath('/panitia/undangan/template');
    revalidatePath('/undangan/[inviteToken]', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Mengambil daftar seluruh undangan dosen beserta status kehadiran
 */
export async function listLecturerInvitationsAction(params?: {
  searchQuery?: string;
  filterAttendance?: 'ALL' | 'HADIR' | 'BELUM';
}): Promise<{
  success: boolean;
  lecturers: LecturerListItemDTO[];
  totalCount: number;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session) {
      return { success: false, lecturers: [], totalCount: 0, error: 'Sesi login tidak valid.' };
    }

    const admin = createAdminClient();
    const searchQuery = params?.searchQuery?.trim().toLowerCase() || '';
    const attendanceFilter = params?.filterAttendance || 'ALL';

    // 1. Ambil data dosen
    let query = admin
      .from('lecturer_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(
        `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,invitation_code.ilike.%${searchQuery}%`
      );
    }

    const { data: lecturers, error: lecError } = await query;
    if (lecError) {
      return { success: false, lecturers: [], totalCount: 0, error: lecError.message };
    }

    // 2. Ambil checkin records dosen
    const { data: checkins } = await admin
      .from('checkins')
      .select('lecturer_id, checked_at, method')
      .not('lecturer_id', 'is', null);

    const checkinMap = new Map<string, { checked_at: string; method: string }>();
    if (checkins) {
      for (const c of checkins) {
        if (c.lecturer_id) {
          checkinMap.set(c.lecturer_id, {
            checked_at: c.checked_at,
            method: c.method,
          });
        }
      }
    }

    // 3. Gabungkan dan filter
    let list: LecturerListItemDTO[] = (lecturers || []).map((l) => {
      const chk = checkinMap.get(l.id);
      return {
        id: l.id,
        fullName: l.full_name,
        email: l.email,
        phone: l.phone,
        invitationCode: l.invitation_code,
        publicToken: l.public_token,
        qrToken: l.qr_token,
        isActive: l.is_active,
        createdAt: l.created_at,
        hasCheckedIn: Boolean(chk),
        checkedInAt: chk?.checked_at || null,
        checkinMethod: chk?.method || null,
      };
    });

    if (attendanceFilter === 'HADIR') {
      list = list.filter((l) => l.hasCheckedIn);
    } else if (attendanceFilter === 'BELUM') {
      list = list.filter((l) => !l.hasCheckedIn);
    }

    return {
      success: true,
      lecturers: list,
      totalCount: list.length,
    };
  } catch (err: any) {
    return {
      success: false,
      lecturers: [],
      totalCount: 0,
      error: err.message || 'Terjadi kesalahan sistem.',
    };
  }
}

/**
 * Menyimpan (Tambah baru atau Edit) Undangan Dosen
 * Catatan penting: invitationCode, publicToken, dan qrToken bersifat IMMUTABLE saat edit nama/email.
 */
export async function saveLecturerInvitationAction(data: {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
}): Promise<{ success: boolean; error?: string; lecturerId?: string }> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return {
        success: false,
        error: 'Akses ditolak. Hanya Admin Panitia yang dapat mengelola undangan dosen.',
      };
    }

    const cleanName = data.fullName.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, error: 'Nama dan gelar dosen minimal 3 karakter.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Alamat email dosen tidak valid.' };
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, error: 'Nomor WhatsApp / HP tidak valid.' };
    }

    const admin = createAdminClient();

    if (data.id) {
      // 1. UPDATE EXISTING DOSEN
      // Cek apakah email aktif sudah dipakai dosen lain
      const { data: duplicate } = await admin
        .from('lecturer_invitations')
        .select('id')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .neq('id', data.id)
        .single();

      if (duplicate) {
        return {
          success: false,
          error: `Alamat email "${cleanEmail}" sudah digunakan pada undangan dosen aktif lainnya.`,
        };
      }

      // Update data tanpa mengubah tokens
      const { error: updateError } = await admin
        .from('lecturer_invitations')
        .update({
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await admin.from('audit_logs').insert({
        actor_id: session.id,
        action: 'UPDATE_LECTURER_INVITATION',
        entity_type: 'lecturer_invitations',
        entity_id: data.id,
        details: { fullName: cleanName, email: cleanEmail },
      });

      revalidatePath('/panitia/undangan/dosen');
      return { success: true, lecturerId: data.id };
    } else {
      // 2. CREATE NEW DOSEN
      // Cek apakah email aktif sudah terdaftar
      const { data: duplicate } = await admin
        .from('lecturer_invitations')
        .select('id')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .single();

      if (duplicate) {
        return {
          success: false,
          error: `Alamat email "${cleanEmail}" sudah terdaftar sebagai undangan aktif. Satu email hanya boleh memiliki 1 undangan aktif.`,
        };
      }

      // Generate immutable tokens
      const { count } = await admin
        .from('lecturer_invitations')
        .select('*', { count: 'exact', head: true });

      const nextNum = (count || 0) + 1;
      const invitationCode = `DOS-${String(nextNum).padStart(3, '0')}`;
      const publicToken = `inv_${crypto.randomBytes(16).toString('hex')}`;
      const qrToken = `dos_qr_${crypto.randomBytes(16).toString('hex')}`;

      const { data: inserted, error: insertError } = await admin
        .from('lecturer_invitations')
        .insert({
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          invitation_code: invitationCode,
          public_token: publicToken,
          qr_token: qrToken,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        return { success: false, error: insertError?.message || 'Gagal menambahkan undangan dosen.' };
      }

      await admin.from('audit_logs').insert({
        actor_id: session.id,
        action: 'CREATE_LECTURER_INVITATION',
        entity_type: 'lecturer_invitations',
        entity_id: inserted.id,
        details: { fullName: cleanName, email: cleanEmail, invitationCode },
      });

      revalidatePath('/panitia/undangan/dosen');
      return { success: true, lecturerId: inserted.id };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Toggle Status Aktif / Nonaktif Undangan Dosen
 */
export async function toggleLecturerActiveAction(id: string): Promise<{
  success: boolean;
  newStatus?: boolean;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return { success: false, error: 'Akses ditolak.' };
    }

    const admin = createAdminClient();

    const { data: lecturer, error: fetchError } = await admin
      .from('lecturer_invitations')
      .select('id, is_active, email')
      .eq('id', id)
      .single();

    if (fetchError || !lecturer) {
      return { success: false, error: 'Undangan dosen tidak ditemukan.' };
    }

    const newStatus = !lecturer.is_active;

    // Jika mengaktifkan kembali, pastikan email belum aktif di record lain
    if (newStatus) {
      const { data: duplicate } = await admin
        .from('lecturer_invitations')
        .select('id')
        .eq('email', lecturer.email)
        .eq('is_active', true)
        .neq('id', id)
        .single();

      if (duplicate) {
        return {
          success: false,
          error: `Tidak dapat mengaktifkan kembali: email "${lecturer.email}" sudah digunakan oleh undangan aktif lain.`,
        };
      }
    }

    const { error: updateError } = await admin
      .from('lecturer_invitations')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: newStatus ? 'ACTIVATE_LECTURER_INVITATION' : 'DEACTIVATE_LECTURER_INVITATION',
      entity_type: 'lecturer_invitations',
      entity_id: id,
    });

    revalidatePath('/panitia/undangan/dosen');
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Menjadwalkan pengiriman email undangan dosen ke antrean email_jobs
 */
export async function enqueueLecturerEmailAction(lecturerId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getCurrentStaffSession();
    if (!session || session.role !== 'ADMIN_PANITIA') {
      return { success: false, error: 'Akses ditolak.' };
    }

    const admin = createAdminClient();

    const { data: lecturer, error: lecError } = await admin
      .from('lecturer_invitations')
      .select('id, full_name, email, invitation_code')
      .eq('id', lecturerId)
      .single();

    if (lecError || !lecturer) {
      return { success: false, error: 'Undangan dosen tidak ditemukan.' };
    }

    const dedupeKey = `lecturer_invitation_${lecturer.id}_${Date.now()}`;
    const { error: jobError } = await admin.from('email_jobs').insert({
      kind: 'lecturer_invitation',
      lecturer_id: lecturer.id,
      recipient_email: lecturer.email,
      dedupe_key: dedupeKey,
      status: 'pending',
      run_after: new Date().toISOString(),
    });

    if (jobError) {
      return { success: false, error: 'Gagal memasukkan email ke antrean pengiriman.' };
    }

    await admin.from('audit_logs').insert({
      actor_id: session.id,
      action: 'ENQUEUE_LECTURER_EMAIL',
      entity_type: 'email_jobs',
      entity_id: lecturer.id,
      details: { email: lecturer.email, code: lecturer.invitation_code },
    });

    return {
      success: true,
      message: `Undangan email untuk ${lecturer.full_name} telah dijadwalkan ke antrean pengiriman.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * Public Projection: Mengambil detail surat undangan personal dosen berdasarkan public_token
 */
export async function getPublicInvitationByTokenAction(
  token: string
): Promise<PublicInvitationViewDTO | null> {
  if (!token || token.trim().length === 0) return null;

  try {
    const admin = createAdminClient();

    // 1. Ambil data undangan dosen
    const { data: lecturer, error: lecError } = await admin
      .from('lecturer_invitations')
      .select('*')
      .eq('public_token', token.trim())
      .single();

    if (lecError || !lecturer) {
      return null;
    }

    // 2. Ambil data event & template
    const { data: event } = await admin
      .from('event_settings')
      .select('event_name, event_start_at, venue_name, venue_address, invitation_template')
      .eq('id', 1)
      .single();

    const templateRaw = (event?.invitation_template as Record<string, any>) || {};
    const subject = templateRaw.subject || DEFAULT_INVITATION_TEMPLATE.subject;
    const greeting = templateRaw.greeting || DEFAULT_INVITATION_TEMPLATE.greeting;
    const rawBody = templateRaw.body || DEFAULT_INVITATION_TEMPLATE.body;
    const closing = templateRaw.closing || DEFAULT_INVITATION_TEMPLATE.closing;
    const senderName = templateRaw.senderName || DEFAULT_INVITATION_TEMPLATE.senderName;

    // Interpolasi placeholder {{nama_dosen}} dengan aman
    const renderedBody = rawBody.replace(/\{\{nama_dosen\}\}/g, lecturer.full_name);

    return {
      id: lecturer.id,
      fullName: lecturer.full_name,
      email: lecturer.email,
      invitationCode: lecturer.invitation_code,
      publicToken: lecturer.public_token,
      qrToken: lecturer.qr_token,
      isActive: lecturer.is_active,
      eventName: event?.event_name || 'MEMORIA 2026',
      eventStartAt: event?.event_start_at || '2026-11-20T18:30:00+07:00',
      venueName: event?.venue_name || 'Grand Ballroom & Theatre Hall',
      venueAddress:
        event?.venue_address ||
        'Telkom University Landmark Hall, Gedung Selaru Lt. 4, Bandung',
      template: {
        subject,
        greeting,
        renderedBody,
        closing,
        senderName,
      },
    };
  } catch (err) {
    console.error('[getPublicInvitationByTokenAction] Error:', err);
    return null;
  }
}

