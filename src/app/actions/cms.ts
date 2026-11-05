'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentStaffSession } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export interface EventSettingsDTO {
  id: number;
  eventName: string;
  tagline: string;
  description: string;
  eventStartAt: string;
  eventEndAt?: string | null;
  timezone: string;
  venueName: string;
  venueAddress: string;
  footerText: string;
  bandName: string;
  bandDescription: string;
  bandImagePath: string;
  fashionTitle: string;
  fashionDescription: string;
  fashionImagePath: string;
  awardingTitle: string;
  awardingDescription: string;
  fashionPageVisible: boolean;
  awardingPageVisible: boolean;
}

/**
 * getPublicEventSettings
 * Proyeksi data publik aman untuk Beranda, Countdown & Halaman publik.
 * Membaca langsung data riil dari Supabase PostgreSQL secara server-side
 * dengan whitelist kolom publik agar tidak mengekspos template surat internal panitia.
 * HAPUS SEMUA FAKE-FALLBACK & MOCK DATA.
 */
export async function getPublicEventSettings(): Promise<EventSettingsDTO> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('event_settings')
    .select(`
      id, event_name, tagline, description,
      event_start_at, timezone,
      venue_name, venue_address, footer_text,
      band_name, band_description, band_image_path,
      fashion_title, fashion_description, fashion_image_path,
      awarding_title, awarding_description,
      fashion_page_visible, awarding_page_visible
    `)
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('[getPublicEventSettings] Database read error:', error);
    throw new Error(
      error?.message || 'Pengaturan acara belum dikonfigurasi pada database Supabase.'
    );
  }

  return {
    id: data.id,
    eventName: data.event_name || 'MEMORIA',
    tagline: data.tagline || '',
    description: data.description || '',
    eventStartAt: data.event_start_at,
    eventEndAt: null,
    timezone: data.timezone || 'Asia/Jakarta',
    venueName: data.venue_name || '',
    venueAddress: data.venue_address || '',
    footerText: data.footer_text || '',
    bandName: data.band_name || '',
    bandDescription: data.band_description || '',
    bandImagePath: data.band_image_path || '/images/band-silhouette.png',
    fashionTitle: data.fashion_title || 'Panggung Fashion Show',
    fashionDescription: data.fashion_description || '',
    fashionImagePath: data.fashion_image_path || '/images/fashion-model-clean.png',
    awardingTitle: data.awarding_title || 'The Golden Moment Awarding',
    awardingDescription: data.awarding_description || '',
    fashionPageVisible: Boolean(data.fashion_page_visible),
    awardingPageVisible: Boolean(data.awarding_page_visible),
  };
}

/**
 * updateEventSettingsAction (Admin Only)
 * Memperbarui informasi acara, band, teaser, atau visibilitas halaman.
 * Melakukan verifikasi baca ulang ke DB untuk menjamin data benar-benar tersimpan.
 */
export async function updateEventSettingsAction(payload: Partial<EventSettingsDTO>) {
  const staff = await getCurrentStaffSession();
  if (!staff || staff.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak mengubah konten website.' };
  }

  const adminClient = createAdminClient();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.eventName !== undefined) updateData.event_name = payload.eventName;
  if (payload.tagline !== undefined) updateData.tagline = payload.tagline;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.eventStartAt !== undefined) updateData.event_start_at = payload.eventStartAt;
  if (payload.timezone !== undefined) updateData.timezone = payload.timezone;
  if (payload.venueName !== undefined) updateData.venue_name = payload.venueName;
  if (payload.venueAddress !== undefined) updateData.venue_address = payload.venueAddress;
  if (payload.footerText !== undefined) updateData.footer_text = payload.footerText;

  // Band tunggal
  if (payload.bandName !== undefined) updateData.band_name = payload.bandName;
  if (payload.bandDescription !== undefined) updateData.band_description = payload.bandDescription;
  if (payload.bandImagePath !== undefined) updateData.band_image_path = payload.bandImagePath;

  // Teasers
  if (payload.fashionTitle !== undefined) updateData.fashion_title = payload.fashionTitle;
  if (payload.fashionDescription !== undefined) updateData.fashion_description = payload.fashionDescription;
  if (payload.fashionImagePath !== undefined) updateData.fashion_image_path = payload.fashionImagePath;

  if (payload.awardingTitle !== undefined) updateData.awarding_title = payload.awardingTitle;
  if (payload.awardingDescription !== undefined) updateData.awarding_description = payload.awardingDescription;

  // Page visibility toggles
  if (payload.fashionPageVisible !== undefined) updateData.fashion_page_visible = payload.fashionPageVisible;
  if (payload.awardingPageVisible !== undefined) updateData.awarding_page_visible = payload.awardingPageVisible;

  const { data: updatedRow, error } = await adminClient
    .from('event_settings')
    .upsert({ id: 1, ...updateData })
    .select()
    .single();

  if (error || !updatedRow) {
    return { success: false, message: error?.message || 'Gagal menyimpan perubahan ke database.' };
  }

  // Revalidate semua halaman yang membaca CMS
  revalidatePath('/');
  revalidatePath('/fashion-show');
  revalidatePath('/awarding');
  revalidatePath('/panitia/website/beranda');
  revalidatePath('/panitia/website/band');
  revalidatePath('/panitia/website/teaser-fashion-show');
  revalidatePath('/panitia/website/teaser-awarding');
  revalidatePath('/panitia/fashion-show');
  revalidatePath('/panitia/awarding');

  return { success: true, updated: updatedRow };
}
